export async function getChatbotResponse(message) {
  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return data.reply || "Sorry, I couldn’t understand.";
  } catch (error) {
    console.error("Error talking to backend:", error);
    return "Something went wrong. Please try again later.";
  }
}
