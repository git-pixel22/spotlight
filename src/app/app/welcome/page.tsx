import { firstName, requireUser } from "@/lib/session";
import { isSupported, ruleFor } from "@/lib/channels";
import { WelcomeFlow } from "./welcome-flow";

export default async function Welcome() {
  const user = await requireUser();
  const channels = user.channels.map((c) => ({
    id: c.id,
    service: c.service,
    label: ruleFor(c.service).label,
    name: c.displayName ?? c.name,
    avatar: c.avatar,
    supported: isSupported(c.service),
  }));
  return (
    <WelcomeFlow
      firstName={firstName(user)}
      existingProfile={user.profile}
      channels={channels}
      selectedIds={user.selectedChannelIds}
    />
  );
}
