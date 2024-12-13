"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Camera,
  Salad,
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

// Accepted MIME types
const ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
];

// Maximum image size in bytes (10MB)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Nutrition Data Type
interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

export default function FoodNutritionAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      // Validate file type and size
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        setError(
          "Please upload a valid image type (PNG, JPEG, WEBP, HEIC, HEIF)"
        );
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError("Image size should not exceed 10MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setImage(file);
      setError(null);
    },
    []
  );

  const handleImageIdentify = async () => {
    if (!image) {
      setError("Please upload an image first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      // Replace with your actual nutrition API endpoint
      const response = await fetch("/api/food-nutrition", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to identify food");
      }

      const data: NutritionData = await response.json();
      setNutritionData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setImagePreview(null);
    setNutritionData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {/* <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card shadow-md py-4 px-6 flex items-center"
      >
        <div className="flex items-center bg-primary/20 p-3 rounded-full space-x-3">
          <Salad className="text-primary/60 w-8 h-8" />
          <h1 className="text-3xl font-bold">Fitty</h1>
        </div>
      </motion.header> */}

      <main className="container mx-auto my-12 flex-grow flex flex-wrap gap-5 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Card className="rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Instant Nutrition Insights
              </CardTitle>
              <CardDescription>
                Transform any meal into a personalized nutritional breakdown.
                Simply snap a photo, and instantly unlock the details you need
                to make smarter, healthier choices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {!nutritionData ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex flex-col items-center">
                      <Input
                        id="picture"
                        type="file"
                        accept={ACCEPTED_MIME_TYPES.join(",")}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="picture"
                        className="cursor-pointer w-full"
                      >
                        <div
                          className={`
                          border-2 border-dashed border-primary rounded-lg p-8 text-center 
                          transition-all duration-300
                          ${
                            imagePreview
                              ? "border-accent/80 bg-accent/20"
                              : "border-muted hover:border-accent/80 hover:bg-accent/20"
                          }
                        `}
                        >
                          {imagePreview ? (
                            <div className="flex justify-center items-center">
                              <Image
                                src={imagePreview}
                                alt="Food Preview"
                                width={400}
                                height={400}
                                objectFit="contain"
                                className="max-w-full max-h-[400px] rounded-md"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-2">
                              <Camera className="w-12 h-12 text-primary/60" />
                              <p>Capture Your Meal Magic</p>
                              <p className="text-sm text-muted-foreground">
                                Snap a pic and unlock nutritional secrets
                              </p>
                            </div>
                          )}
                        </div>
                      </label>

                      {imagePreview && (
                        <Button
                          onClick={handleImageIdentify}
                          disabled={isLoading}
                          className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
                        >
                          {isLoading
                            ? "Decoding Deliciousness..."
                            : "Reveal Nutrition"}
                        </Button>
                      )}

                      {error && (
                        <Alert variant="destructive" className="w-full mt-6">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Oops!</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-16 h-16 text-primary/60 mr-4" />
                      <div>
                        <h2 className="text-2xl font-bold text-primary">
                          {nutritionData.name}
                        </h2>
                        <p className="text-primary/60">Nutrition Decoded</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <NutritionCard
                        icon={<Flame className="text-orange-500" />}
                        title="Calories"
                        value={`${nutritionData.calories} kcal`}
                        description="Your energy blueprint"
                      />
                      <NutritionCard
                        icon={<Salad className="text-green-500" />}
                        title="Protein"
                        value={`${nutritionData.protein}g`}
                        description="Muscle's best friend"
                      />
                      <NutritionCard
                        icon={<Flame className="text-blue-500" />}
                        title="Carbs"
                        value={`${nutritionData.carbs}g`}
                        description="Your fuel tank"
                      />
                      <NutritionCard
                        icon={<Flame className="text-red-500" />}
                        title="Fat"
                        value={`${nutritionData.fat}g`}
                        description="Essential essentials"
                      />
                    </div>

                    <Button
                      onClick={resetAnalysis}
                      variant="outline"
                      className="w-full mt-6 hover:text-foreground"
                    >
                      Analyze Another Bite
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works Section - Move this below the nutrition card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl bg-card border rounded-xl p-8" // Add margin-top for spacing
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold flex items-center justify-center">
              <Zap className="mr-3" /> How It Works
            </h2>
            <p className="mt-2">
              Nutrition insights are just three simple steps away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-emerald-50 rounded-full p-4 inline-block mb-4">
                <Camera className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="font-bold mb-2">Snap Your Meal</h3>
              <p className="text-muted-foreground">
                Capture a clear image of your food. From restaurant plates to
                home-cooked meals, Fitty can analyze it all.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-50 rounded-full p-4 inline-block mb-4">
                <Sparkles className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="font-bold mb-2">AI Magic Happens</h3>
              <p className="text-muted-foreground">
                Our advanced AI recognizes your food, cross-references nutrition
                databases, and extracts precise nutritional information.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-50 rounded-full p-4 inline-block mb-4">
                <Target className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="font-bold mb-2">Instant Insights</h3>
              <p className="text-muted-foreground">
                Get instant breakdown of calories, protein, carbs, and fat.
                Track your nutrition effortlessly, no manual logging required.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Nutrition Card Component
const NutritionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
}> = ({ icon, title, value, description }) => (
  <div className="bg-card p-4 rounded-lg shadow-md flex items-center space-x-4">
    <div className="p-3 bg-emerald-50 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-bold text-primary">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  </div>
);
