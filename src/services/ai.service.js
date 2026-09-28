import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.7-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function testAI(){
    await model.invoke("what is gen AI? In 100 words.").then((response)=>{
        console.log(response.text);
    })
}