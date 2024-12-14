import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Helper function to check if base64 is valid
const isBase64 = (str: string) => {
  const regex = /^([A-Za-z0-9+/=]+)$/;
  return regex.test(str);
};

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { image } = body;

    // Basic validation for image and mimeType
    if (!image) {
      return NextResponse.json(
        { error: "Image and mime type are required." },
        { status: 400 }
      );
    }

    const [mimeTypeRaw, base64Data] = image.split(",");

    // Remove data: from the start of mimeTypeRaw variable and base64 from the end of the variable
    const mimeType = mimeTypeRaw.split(";")[0].split(":")[1];

    if (!isBase64(base64Data)) {
      return NextResponse.json(
        {
          error:
            "The image format is invalid. Please ensure it's in base64 format.",
        },
        { status: 400 }
      );
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(
      process.env.GENERATIVE_AI_API_KEY || ""
    );

    // Define the schema for the expected nutritional information
    const schema = {
      description: "Extracted nutritional information",
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description: "Name of the food item",
        },
        calories: {
          type: SchemaType.NUMBER,
          description: "Calories per 100g",
        },
        protein: {
          type: SchemaType.NUMBER,
          description: "Protein per 100g",
        },
        carbs: {
          type: SchemaType.NUMBER,
          description: "Carbohydrates per 100g",
        },
        fat: {
          type: SchemaType.NUMBER,
          description: "Fat per 100g",
        },
        note: {
          type: SchemaType.STRING,
          description: "Additional notes or comments on that food",
        },
      },
      required: ["name", "calories", "protein", "carbs", "fat"],
    };

    // Get the model from Google Generative AI with the defined schema
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // Prepare the prompt for extracting nutrition information
    const prompt = `
    I DON'T WANT A NO OR ANY REASONS, WHATEVER THE IMAGE IS GET ME THE FOLLOWING INFO BY FIGURING IT OUT EVERYTHING OTHERWISE 
    THE PERSON DIES
      Analyze the food item in the provided image and extract the following nutritional information:
      - Name of the food
      - Calories (per 100g)
      - Protein (per 100g)
      - Carbohydrates (per 100g)
      - Fat (per 100g)
      - Additional notes or comments on that food
    `;

    // Send the image data to Google Generative AI API with the nutrition extraction prompt
    const result: any = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    // Extract the content from the response
    const candidates = result?.response?.candidates;

    // Check if candidates exist
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        {
          error:
            "Unable to extract nutrition information. Please check the image format or try another image.",
        },
        { status: 500 }
      );
    }

    // Get the nutrition data from the first candidate
    const nutritionDataRAW = candidates[0]?.content?.parts?.[0]?.text;
    const nutritionData = JSON.parse(nutritionDataRAW);

    if (!nutritionData) {
      return NextResponse.json(
        {
          error:
            "Nutritional information wasn't returned as expected. Please try again later.",
        },
        { status: 500 }
      );
    }

    // If the parsed data doesn't contain the expected fields, return an error
    if (
      !nutritionData ||
      !nutritionData.name ||
      !nutritionData.calories ||
      !nutritionData.protein ||
      !nutritionData.carbs ||
      !nutritionData.fat ||
      !nutritionData.note
    ) {
      return NextResponse.json(
        {
          error:
            "The extracted nutritional information is incomplete. Please try another image.",
        },
        { status: 500 }
      );
    }

    // Return the structured nutritional data as an object
    return NextResponse.json(nutritionData, { status: 200 });
  } catch (err) {
    console.error("Error during API request:", err);
    // Generic error handling
    return NextResponse.json(
      {
        error:
          "Something went wrong while processing your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
