import { firstName, requireUser } from "@/lib/session";
import { isSupported, ruleFor } from "@/lib/channels";
import { syncChannels } from "@/lib/buffer/sync";
import { WelcomeFlow } from "./welcome-flow";
import { DeleteData } from "./delete-data";

export default async function Welcome() {
  // Fresh from Buffer on every visit, so "I've connected one" picks up new channels.
  const user = await syncChannels(await requireUser());
  const channels = user.channels.map((c) => ({
    id: c.id,
    service: c.service,
    label: isSupported(c.service) ? ruleFor(c.service).label : c.service.charAt(0).toUpperCase() + c.service.slice(1),
    name: c.displayName ?? c.name,
    avatar: c.avatar,
    supported: isSupported(c.service),
  }));
  return (
    <>
      <WelcomeFlow
        firstName={firstName(user)}
        existingProfile={user.profile}
        channels={channels}
        selectedIds={user.selectedChannelIds}
      />
      {user.profile && <DeleteData />}
    </>
  );
}
