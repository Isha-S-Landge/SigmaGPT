import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getgenerativeAIResponse = async (message) => {
    try {
        const completion = await client.chat.completions.create({
            messages: [{ role: "user", content: message }],
            model: "llama-3.3-70b-versatile",
        });
        return completion.choices[0].message.content;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export default getgenerativeAIResponse;