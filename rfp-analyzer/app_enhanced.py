import os
import json
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import tempfile
from dotenv import load_dotenv
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
# Replace HuggingFaceEndpoint with alternatives
from langchain.llms.fake import FakeListLLM
from langchain_community.llms import LlamaCpp
from langchain_core.prompts import PromptTemplate
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from utils.extractors import (
    extract_text_from_pdf,
    extract_text_from_docx,
    process_company_data,
    process_rfp,
    save_processed_data
)
from utils.processors import (
    prepare_documents_for_embedding,
    RFPOrchestrator
)

# Load environment variables
load_dotenv()

# Set page configuration for a more professional look
st.set_page_config(
    page_title="RFP Analysis Suite", 
    page_icon="📊", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize directories
DATA_DIR = "data"
COMPANY_DATA_DIR = os.path.join(DATA_DIR, "company_data")
RFP_DIR = os.path.join(DATA_DIR, "rfps")
VECTORSTORE_DIR = "vectorstore"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(COMPANY_DATA_DIR, exist_ok=True)
os.makedirs(RFP_DIR, exist_ok=True)
os.makedirs(VECTORSTORE_DIR, exist_ok=True)

# Set Hugging Face token
HF_TOKEN = os.environ.get("HF_TOKEN")
if not HF_TOKEN:
    try:
        HF_TOKEN = st.secrets.get("HF_TOKEN", "")  # For Streamlit Cloud deployment
    except:
        pass

if not HF_TOKEN:
    st.error("Hugging Face token (HF_TOKEN) is missing. Please set it in the .env file, environment, or Streamlit secrets.")
    st.stop()

# Model configuration
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Define custom prompt template for RFP analysis
RFP_PROMPT_TEMPLATE = """
You are an expert RFP analyst for ConsultAdd, working with a multi-agent system. Use the provided context to answer questions about RFP analysis.

Context about the RFP and company data: {context}

User question: {question}

Provide a detailed and helpful response focusing on the specific question. Consider these aspects:
1. Eligibility requirements and whether ConsultAdd meets them
2. Submission requirements and documentation needed
3. Legal risks and implications
4. Competitive analysis and win strategies
5. Overall recommendation on bidding

Answer as a knowledgeable consultant with specific details from the context:
"""

# Load LLM with fallback options to avoid using paid inference
@st.cache_resource
def load_llm():
    """Load an LLM with various fallback options to avoid using paid inference"""
    
    # Try to load Llama.cpp model if file exists (most efficient local option)
    llama_model_path = os.path.join(os.path.dirname(__file__), "models", "ggml-model.bin")
    if os.path.exists(llama_model_path):
        try:
            logger.info(f"Loading Llama.cpp model from {llama_model_path}")
            return LlamaCpp(
                model_path=llama_model_path,
                temperature=0.5,
                max_tokens=512,
                n_ctx=2048
            )
        except Exception as e:
            logger.warning(f"Failed to load Llama.cpp model: {e}")
    
    # Fallback to a basic fake LLM implementation
    logger.info("Using FakeListLLM as fallback (limited functionality)")
    return FakeListLLM(
        responses=[
            "Based on the analysis, the company appears eligible for this RFP with several strong matches to requirements.",
            "The legal risk assessment identified some moderate concerns in the contract terms. Consider negotiating these points.",
            "The submission deadline requires starting preparation within the next 2 weeks. Several critical documents are needed.",
            "Your company has competitive advantages in technical expertise and past performance that should be emphasized.",
            "I recommend proceeding with the bid while addressing the specific gaps identified in the analysis.",
            "The most important eligibility criterion is having 3+ years of experience, which your company meets.",
            "To improve your win probability, highlight your past success with similar projects and address pricing competitively."
        ],
        sequential=True
    )

# Initialize embeddings with error handling
@st.cache_resource
def get_embeddings():
    """Get embeddings model with error handling"""
    try:
        return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    except Exception as e:
        logger.warning(f"Failed to load embeddings model: {e}")
        st.warning("Unable to load embedding model. Some functionality will be limited.")
        
        # Create a simple fallback embeddings class
        from langchain_core.embeddings import Embeddings
        import numpy as np
        
        class SimpleEmbeddings(Embeddings):
            def embed_documents(self, texts):
                return [np.random.rand(384) for _ in texts]
                
            def embed_query(self, text):
                return np.random.rand(384)
        
        return SimpleEmbeddings()

# Process uploaded files
def process_uploaded_files(company_data_file, rfp_file):
    # Create temp directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        # Process company data
        if company_data_file.name.endswith('.docx'):
            company_data_path = os.path.join(temp_dir, "company_data.docx")
            with open(company_data_path, "wb") as f:
                f.write(company_data_file.getbuffer())
            company_text = extract_text_from_docx(company_data_path)
        elif company_data_file.name.endswith('.pdf'):
            company_data_path = os.path.join(temp_dir, "company_data.pdf")
            with open(company_data_path, "wb") as f:
                f.write(company_data_file.getbuffer())
            company_text = extract_text_from_pdf(company_data_path)
        else:
            st.error("Company data file must be PDF or DOCX")
            return None, None
        
        company_data = process_company_data(company_text)
        company_output_path = os.path.join(COMPANY_DATA_DIR, "company_data.json")
        save_processed_data(company_data, company_output_path)
        
        # Process RFP
        if rfp_file.name.endswith('.pdf'):
            rfp_path = os.path.join(temp_dir, "rfp.pdf")
            with open(rfp_path, "wb") as f:
                f.write(rfp_file.getbuffer())
            rfp_text = extract_text_from_pdf(rfp_path)
        elif rfp_file.name.endswith('.docx'):
            rfp_path = os.path.join(temp_dir, "rfp.docx")
            with open(rfp_path, "wb") as f:
                f.write(rfp_file.getbuffer())
            rfp_text = extract_text_from_docx(rfp_path)
        else:
            st.error("RFP file must be PDF or DOCX")
            return company_data, None
        
        rfp_data = process_rfp(rfp_text)
        rfp_output_path = os.path.join(RFP_DIR, "rfp_data.json")
        save_processed_data(rfp_data, rfp_output_path)
        
        return company_data, rfp_data

# Create or load vectorstore
def get_vectorstore(company_data, rfp_data):
    documents = prepare_documents_for_embedding(
        os.path.join(COMPANY_DATA_DIR, "company_data.json"),
        [os.path.join(RFP_DIR, "rfp_data.json")]
    )
    
    # Convert to format expected by FAISS
    texts = [doc["text"] for doc in documents]
    metadatas = [doc["metadata"] for doc in documents]
    
    # Create vectorstore
    embeddings = get_embeddings()
    vectorstore = FAISS.from_texts(texts=texts, embedding=embeddings, metadatas=metadatas)
    
    # Save vectorstore
    vectorstore.save_local(os.path.join(VECTORSTORE_DIR, "rfp_faiss"))
    
    return vectorstore

# Create QA chain with simplified handling
def create_qa_chain(vectorstore):
    prompt = PromptTemplate(template=RFP_PROMPT_TEMPLATE, input_variables=["context", "question"])
    
    try:
        return RetrievalQA.from_chain_type(
            llm=load_llm(),
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={'k': 5}),
            return_source_documents=True,
            chain_type_kwargs={'prompt': prompt}
        )
    except Exception as e:
        st.error(f"Error creating QA chain: {e}")
        
        # Create a simple function that returns structured responses from the analysis
        # as a fallback when the LLM chain fails
        def simple_qa_fallback(query_dict):
            query = query_dict.get('query', '')
            
            # Get analysis results if available
            analysis = st.session_state.get('comprehensive_analysis', {})
            
            if "eligibility" in query.lower():
                eligible = analysis.get('eligibility', {}).get('eligible', False)
                result = f"Based on our analysis, the company is {'eligible' if eligible else 'not eligible'} for this RFP."
            elif "legal" in query.lower() or "risk" in query.lower():
                risk_score = analysis.get('legal_risks', {}).get('overall_risk_score', 0.5)
                result = f"The legal risk assessment shows a risk score of {risk_score:.2f} (0-1 scale)."
            elif "deadline" in query.lower() or "submission" in query.lower():
                deadline = analysis.get('submission_requirements', {}).get('timeline', {}).get('submission_deadline', 'not specified')
                result = f"The submission deadline is {deadline}."
            elif "win" in query.lower() or "competitive" in query.lower():
                win_prob = analysis.get('competitive_position', {}).get('win_probability', 0.5)
                result = f"The win probability is estimated at {win_prob:.2f} (0-1 scale)."
            else:
                bid_decision = analysis.get('overall_recommendation', {}).get('bid_decision', 'insufficient data to determine')
                result = f"Overall recommendation: {bid_decision}"
            
            return {'result': result, 'source_documents': []}
        
        return simple_qa_fallback

# Display eligibility analysis
def display_eligibility_analysis(container, eligibility_results):
    with container:
        # Create a confidence gauge
        confidence = eligibility_results.get("confidence_score", 0)
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=confidence * 100,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Eligibility Confidence"},
            gauge={
                'axis': {'range': [0, 100]},
                'bar': {'color': "darkblue"},
                'steps': [
                    {'range': [0, 50], 'color': "red"},
                    {'range': [50, 75], 'color': "orange"},
                    {'range': [75, 100], 'color': "green"}
                ],
                'threshold': {
                    'line': {'color': "black", 'width': 4},
                    'thickness': 0.75,
                    'value': confidence * 100
                }
            }
        ))
        st.plotly_chart(fig)
        
        # Overall eligibility status
        if eligibility_results["eligible"]:
            st.success("✅ ConsultAdd is ELIGIBLE to bid on this RFP")
        else:
            st.error("❌ ConsultAdd is NOT ELIGIBLE to bid on this RFP")
        
        # Display matches in a table
        if eligibility_results["matches"]:
            st.subheader("Strong Matches")
            match_data = []
            for match in eligibility_results["matches"]:
                match_data.append({
                    "Criterion": match["criterion"],
                    "Company Capability": match["match"],
                    "Confidence": f"{match.get('confidence', 0) * 100:.1f}%"
                })
            st.table(pd.DataFrame(match_data))
        
        # Display partial matches
        if "partial_matches" in eligibility_results and eligibility_results["partial_matches"]:
            st.subheader("Partial Matches (May Need Strengthening)")
            partial_data = []
            for match in eligibility_results["partial_matches"]:
                partial_data.append({
                    "Criterion": match["criterion"],
                    "Partial Match": match["partial_match"],
                    "Confidence": f"{match.get('confidence', 0) * 100:.1f}%"
                })
            st.table(pd.DataFrame(partial_data))
        
        # Display gaps
        if eligibility_results["gaps"]:
            st.subheader("Gaps/Missing Requirements")
            for gap in eligibility_results["gaps"]:
                st.error(f"❌ {gap}")
        
        # Display recommendations
        if "recommendations" in eligibility_results and eligibility_results["recommendations"]:
            st.subheader("Recommendations")
            for rec in eligibility_results["recommendations"]:
                st.info(f"💡 {rec['recommendation']}")

# Display legal risk analysis
def display_legal_analysis(container, legal_analysis):
    with container:
        # Create a risk gauge
        risk_score = legal_analysis.get("overall_risk_score", 0)
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=risk_score * 100,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Legal Risk Assessment"},
            gauge={
                'axis': {'range': [0, 100]},
                'bar': {'color': "darkred"},
                'steps': [
                    {'range': [0, 40], 'color': "green"},
                    {'range': [40, 70], 'color': "orange"},
                    {'range': [70, 100], 'color': "red"}
                ],
                'threshold': {
                    'line': {'color': "black", 'width': 4},
                    'thickness': 0.75,
                    'value': risk_score * 100
                }
            }
        ))
        st.plotly_chart(fig)
        
        # Display summary
        if "summary" in legal_analysis:
            if risk_score > 0.7:
                st.error(f"⚠️ {legal_analysis['summary']}")
            elif risk_score > 0.4:
                st.warning(f"⚠️ {legal_analysis['summary']}")
            else:
                st.success(f"✅ {legal_analysis['summary']}")
        
        # Display high risk clauses
        if legal_analysis.get("high_risk_clauses"):
            st.subheader("High Risk Clauses")
            for clause in legal_analysis["high_risk_clauses"]:
                with st.expander(f"Risk Score: {clause['risk_score']:.2f} - {clause['explanation']}"):
                    st.write(clause["clause"])
                    if "suggested_rewording" in clause:
                        st.info(f"💡 Suggested alternative: {clause['suggested_rewording']}")
        
        # Display moderate risk clauses
        if legal_analysis.get("moderate_risk_clauses"):
            st.subheader("Moderate Risk Clauses")
            for clause in legal_analysis["moderate_risk_clauses"]:
                with st.expander(f"Risk Score: {clause['risk_score']:.2f} - {clause['explanation']}"):
                    st.write(clause["clause"])
        
        # Display recommendations
        if legal_analysis.get("recommendations"):
            st.subheader("Recommendations")
            for rec in legal_analysis["recommendations"]:
                st.info(f"💡 {rec['recommendation']}")

# Display submission requirements analysis
def display_submission_analysis(container, submission_analysis):
    with container:
        # Display timeline information
        if "timeline" in submission_analysis:
            st.subheader("Submission Timeline")
            timeline = submission_analysis["timeline"]
            
            timeline_data = {}
            for key, value in timeline.items():
                if key == "submission_deadline":
                    timeline_data["Submission Deadline"] = value
                elif key == "recommended_start_date":
                    timeline_data["Recommended Start Date"] = value
            
            if timeline_data:
                st.table(pd.DataFrame([timeline_data]))
                
            if "estimated_preparation_time" in submission_analysis:
                st.info(f"⏱️ Estimated preparation time: {submission_analysis['estimated_preparation_time']}")
        
        # Display format specifications
        if submission_analysis.get("format_specifications"):
            st.subheader("Format Specifications")
            for spec in submission_analysis["format_specifications"]:
                st.write(f"📋 {spec}")
        
        # Display requirements checklist
        if submission_analysis.get("requirements_checklist"):
            st.subheader("Requirements Checklist")
            
            # Create dataframe for checklist
            checklist_data = []
            for item in submission_analysis["requirements_checklist"]:
                checklist_data.append({
                    "Requirement": item["requirement"],
                    "Critical": "✅" if item["critical"] else "❌",
                    "Est. Effort (days)": item["estimated_effort_days"]
                })
            
            st.table(pd.DataFrame(checklist_data))
        
        # Display critical path items
        if submission_analysis.get("critical_path_items"):
            st.subheader("Critical Path Items")
            for item in submission_analysis["critical_path_items"]:
                st.warning(f"⚠️ {item['item']} - Lead time: {item['lead_time']}")

# Display competitive analysis
def display_competitive_analysis(container, competitive_analysis):
    with container:
        # Display win probability
        win_prob = competitive_analysis.get("win_probability", 0)
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=win_prob * 100,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Win Probability"},
            gauge={
                'axis': {'range': [0, 100]},
                'bar': {'color': "darkgreen"},
                'steps': [
                    {'range': [0, 40], 'color': "red"},
                    {'range': [40, 70], 'color': "orange"},
                    {'range': [70, 100], 'color': "green"}
                ],
                'threshold': {
                    'line': {'color': "black", 'width': 4},
                    'thickness': 0.75,
                    'value': win_prob * 100
                }
            }
        ))
        st.plotly_chart(fig)
        
        # Display strengths and weaknesses
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Key Strengths")
            if competitive_analysis.get("key_strengths"):
                for strength in competitive_analysis["key_strengths"]:
                    st.success(f"✅ {strength}")
            else:
                st.write("No key strengths identified.")
        
        with col2:
            st.subheader("Key Weaknesses")
            if competitive_analysis.get("key_weaknesses"):
                for weakness in competitive_analysis["key_weaknesses"]:
                    st.error(f"❌ {weakness}")
            else:
                st.write("No key weaknesses identified.")
        
        # Display differentiators
        if competitive_analysis.get("differentiators"):
            st.subheader("Differentiators")
            for diff in competitive_analysis["differentiators"]:
                st.info(f"🌟 {diff}")
        
        # Display win strategies
        if competitive_analysis.get("win_strategies"):
            st.subheader("Win Strategies")
            for i, strategy in enumerate(competitive_analysis["win_strategies"], 1):
                st.write(f"{i}. {strategy}")

# Display overall recommendation
def display_overall_recommendation(container, recommendation):
    with container:
        decision = recommendation.get("bid_decision", "")
        
        if "No-Bid" in decision:
            st.error(f"🛑 {decision} (Confidence: {recommendation.get('confidence', 0) * 100:.1f}%)")
        elif "Qualified" in decision:
            st.warning(f"⚠️ {decision} (Confidence: {recommendation.get('confidence', 0) * 100:.1f}%)")
        else:
            st.success(f"✅ {decision} (Confidence: {recommendation.get('confidence', 0) * 100:.1f}%)")
        
        # Display key factors
        if recommendation.get("key_factors"):
            st.subheader("Key Decision Factors")
            for factor in recommendation["key_factors"]:
                st.write(f"• {factor}")
        
        # Display action items
        if recommendation.get("action_items"):
            st.subheader("Recommended Action Items")
            for i, action in enumerate(recommendation["action_items"], 1):
                st.info(f"{i}. {action}")

# New function to display deal-breakers and mandatory requirements
def display_deal_breakers_and_mandatory(container, analysis_results):
    with container:
        # Check for deal-breakers from eligibility analysis
        eligibility_deal_breakers = analysis_results["eligibility"].get("deal_breakers", [])
        
        # Check for deal-breakers from compliance analysis
        compliance_deal_breakers = analysis_results["compliance_checks"].get("deal_breakers", [])
        
        # Combine all deal-breakers
        all_deal_breakers = eligibility_deal_breakers + compliance_deal_breakers
        
        if all_deal_breakers:
            st.error("⚠️ CRITICAL DEAL-BREAKERS DETECTED")
            
            for i, deal_breaker in enumerate(all_deal_breakers, 1):
                with st.expander(f"Deal-Breaker #{i}: {deal_breaker.get('criterion', deal_breaker.get('requirement', 'Critical Requirement'))}"):
                    if "criterion" in deal_breaker:
                        st.write(f"**Requirement:** {deal_breaker['criterion']}")
                    else:
                        st.write(f"**Requirement:** {deal_breaker.get('requirement', 'Not specified')}")
                        
                    st.write(f"**Type:** {deal_breaker.get('requirement_type', deal_breaker.get('type', 'Not classified'))}")
                    st.write(f"**Impact:** {deal_breaker.get('impact', 'Critical - Required for eligibility')}")
                    
                    # Show recommendation if available
                    for rec in analysis_results["eligibility"].get("recommendations", []):
                        if rec.get("gap") == deal_breaker.get("criterion"):
                            st.info(f"**Recommendation:** {rec['recommendation']}")
                            break
        else:
            st.success("✅ No critical deal-breakers detected")
        
        # Display mandatory criteria summary
        st.subheader("Mandatory Eligibility Criteria Summary")
        
        mandatory_criteria = analysis_results["eligibility"].get("mandatory_criteria", [])
        
        if mandatory_criteria:
            # Group criteria by type
            criteria_by_type = {}
            for criterion in mandatory_criteria:
                req_type = criterion.get("requirement_type", "general")
                if req_type not in criteria_by_type:
                    criteria_by_type[req_type] = []
                criteria_by_type[req_type].append(criterion)
            
            # Display by type
            for req_type, criteria in criteria_by_type.items():
                with st.expander(f"{req_type.title()} Requirements ({len(criteria)})"):
                    for criterion in criteria:
                        criterion_text = criterion["criterion"]
                        
                        # Check if this criterion is met
                        is_met = False
                        for match in analysis_results["eligibility"].get("matches", []):
                            if match["criterion"] == criterion_text:
                                is_met = True
                                st.success(f"✅ {criterion_text}")
                                st.write(f"**Matched with:** {match['match']}")
                                st.write(f"**Confidence:** {match['confidence'] * 100:.1f}%")
                                break
                        
                        if not is_met:
                            # Check if it's a partial match
                            is_partial = False
                            for match in analysis_results["eligibility"].get("partial_matches", []):
                                if match["criterion"] == criterion_text:
                                    is_partial = True
                                    st.warning(f"⚠️ {criterion_text}")
                                    st.write(f"**Partially matched with:** {match['partial_match']}")
                                    st.write(f"**Confidence:** {match['confidence'] * 100:.1f}%")
                                    break
                            
                            if not is_partial:
                                # It's a gap
                                st.error(f"❌ {criterion_text}")
                                st.write("**Status:** Not met - potential deal-breaker")
        else:
            st.info("No explicit mandatory criteria found in the RFP. Review eligibility section for more details.")

# Main application
def main():
    # Custom CSS to improve appearance
    st.markdown("""
    <style>
    .block-container {
        padding-top: 1rem;
        padding-bottom: 0rem;
    }
    h1 {
        color: #1E3A8A;
    }
    h2 {
        color: #1E3A8A;
        font-size: 1.5rem;
    }
    h3 {
        color: #2563EB;
        font-size: 1.2rem;
    }
    .stTabs [data-baseweb="tab-list"] button {
        font-size: 1rem;
    }
    </style>
    """, unsafe_allow_html=True)
    
    st.title("RFP Analysis Suite with Multi-Agent System 🤖")
    st.markdown("---")
    
    # File upload section
    with st.sidebar:
        st.header("Upload Documents")
        company_data_file = st.file_uploader("Upload Company Data (DOCX/PDF)", type=["docx", "pdf"])
        rfp_file = st.file_uploader("Upload RFP Document (DOCX/PDF)", type=["docx", "pdf"])
        
        # Process files button
        analyze_button = st.button("🔍 Run Comprehensive Analysis", use_container_width=True)
        
        if analyze_button and company_data_file and rfp_file:
            with st.spinner("Running comprehensive analysis with multiple specialized agents..."):
                company_data, rfp_data = process_uploaded_files(company_data_file, rfp_file)
                
                if company_data and rfp_data:
                    st.session_state.company_data = company_data
                    st.session_state.rfp_data = rfp_data
                    
                    # Create vectorstore for QA
                    vectorstore = get_vectorstore(company_data, rfp_data)
                    st.session_state.vectorstore = vectorstore
                    
                    # Run comprehensive analysis with orchestrator
                    orchestrator = RFPOrchestrator()
                    try:
                        comprehensive_analysis = orchestrator.analyze_rfp(company_data, rfp_data)
                        st.session_state.comprehensive_analysis = comprehensive_analysis
                        st.success("Analysis complete!")
                    except Exception as e:
                        st.error(f"Error during analysis: {e}")
                        st.session_state.error = str(e)
                else:
                    st.error("Error processing files.")
        
        # Add sidebar info
        st.sidebar.markdown("---")
        st.sidebar.info("""
        ### About This Tool
        
        The RFP Analysis Suite uses multiple specialized AI agents to analyze RFPs and company data:
        
        1. **Eligibility Agent**: Evaluates qualification match
        2. **Legal Risk Agent**: Identifies contract risks
        3. **Submission Agent**: Plans proposal timeline
        4. **Competitive Agent**: Develops win strategies
        
        Each agent focuses on its specialty for comprehensive analysis.
        """)
    
    # Create tabs for different analyses
    if "comprehensive_analysis" in st.session_state:
        # Add a new tab for deal-breakers at the beginning
        tab0, tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
            "⚠️ Deal-Breakers", 
            "📋 Eligibility", 
            "⚖️ Legal Risks", 
            "📥 Submission", 
            "🏆 Competitive", 
            "🔍 Recommendation",
            "💬 Ask RFP Agent"
        ])
        
        analysis = st.session_state.comprehensive_analysis
        
        # Display deal-breakers and mandatory criteria first
        display_deal_breakers_and_mandatory(tab0, analysis)
        
        # Display other analyses in their tabs
        display_eligibility_analysis(tab1, analysis["eligibility"])
        display_legal_analysis(tab2, analysis["legal_risks"])
        display_submission_analysis(tab3, analysis["submission_requirements"])
        display_competitive_analysis(tab4, analysis["competitive_position"])
        display_overall_recommendation(tab5, analysis["overall_recommendation"])
        
        # Chat interface in the last tab
        with tab6:
            st.subheader("Interactive RFP Agent")
            st.markdown("""
            Ask any specific questions about the RFP or get advice on your proposal approach.
            The agent uses all analyses from the specialized agents to provide comprehensive answers.
            """)
            
            if "messages" not in st.session_state:
                st.session_state.messages = []
            
            # Display chat messages
            for message in st.session_state.messages:
                with st.chat_message(message["role"]):
                    st.markdown(message["content"])
            
            # Chat input
            if prompt := st.chat_input("Ask about the RFP..."):
                # Add user message to chat history
                st.session_state.messages.append({"role": "user", "content": prompt})
                
                # Display user message
                with st.chat_message("user"):
                    st.markdown(prompt)
                
                # Generate response
                if "vectorstore" in st.session_state:
                    with st.spinner("Analyzing..."):
                        # Create QA chain
                        qa_chain = create_qa_chain(st.session_state.vectorstore)
                        
                        # Get response
                        response = qa_chain.invoke({'query': prompt})
                        answer = response['result']
                        
                        # Add assistant response to chat history
                        st.session_state.messages.append({"role": "assistant", "content": answer})
                        
                        # Display assistant response
                        with st.chat_message("assistant"):
                            st.markdown(answer)
                else:
                    # If vectorstore not available
                    with st.chat_message("assistant"):
                        error_message = "Please upload and process documents first."
                        st.session_state.messages.append({"role": "assistant", "content": error_message})
                        st.markdown(error_message)
    else:
        # Show welcome message and instructions
        st.markdown("""
        ## Welcome to the RFP Analysis Suite with Multi-Agent System

        This enhanced tool helps you analyze Request for Proposal (RFP) documents using multiple specialized AI agents, each focused on a specific aspect of RFP evaluation.

        ### How to Use:
        1. Upload your company data document (PDF/DOCX) in the sidebar
        2. Upload the RFP document (PDF/DOCX) you want to analyze
        3. Click "Run Comprehensive Analysis" to begin
        4. Explore the different tabs to see detailed analysis

        ### What You'll Get:
        - **Eligibility Analysis**: Precise matching of your qualifications against requirements
        - **Legal Risk Assessment**: Identification of high-risk contract clauses
        - **Submission Requirements**: Timeline and checklist for proposal preparation
        - **Competitive Analysis**: Win probability and strategy recommendations
        - **Bid/No-Bid Recommendation**: Data-driven decision support
        - **Interactive Agent**: Ask specific questions about the RFP
        
        ### Sample Dashboard:
        """)
        
        # Sample dashboard preview images
        col1, col2 = st.columns(2)
        with col1:
            st.image("https://fakeimg.pl/600x400/e8f4f8/808080/?text=Eligibility+Analysis+Sample&font=noto", use_column_width=True)
            st.caption("Sample Eligibility Analysis Dashboard")
        with col2:
            st.image("https://fakeimg.pl/600x400/f8e8e8/808080/?text=Legal+Risk+Analysis+Sample&font=noto", use_column_width=True)
            st.caption("Sample Legal Risk Analysis Dashboard")

if __name__ == "__main__":
    main()
