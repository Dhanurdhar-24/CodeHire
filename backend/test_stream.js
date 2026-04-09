import { chatClient, upsertStreamUser } from "./src/lib/stream.js";

async function test() {
  try {
    const clerkId = "test_clerk_id_123";
    console.log("Upserting stream user...");
    await upsertStreamUser({
      id: clerkId,
      name: "Test User",
      image: "https://example.com/image.png",
    });

    console.log("Creating channel...");
    const channel = chatClient.channel("messaging", "test_call_id_123", {
      name: "Test Channel",
      created_by_id: clerkId,
      members: [clerkId]
    });
    await channel.create();

    console.log("Adding member...");
    await channel.addMembers([clerkId]);
    console.log("Success!");
  } catch (error) {
    console.error("Failed:", error);
  }
}
test();
