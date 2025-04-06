import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export function UserButton() {
  return (
    <ClerkUserButton 
      afterSignOutUrl="/"
      appearance={{
        elements: {
          userButtonAvatarBox: "h-8 w-8",
        },
      }}
    />
  );
}
