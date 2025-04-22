import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";

const testimonials = [
  {
    name: "רותם ואורן",
    eventType: "חתונה",
    quote: "השירות הזה שינה את כל חווית האירוע שלנו! האורחים נהנו לצלם ולשתף, וקיבלנו אלבום מדהים של רגעים מיוחדים.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=988&auto=format&fit=crop",
    stars: 5
  },
  {
    name: "משפחת כהן",
    eventType: "בר מצווה",
    quote: "הפלטפורמה פשוטה מאוד לשימוש, הילדים הצעירים והמבוגרים הצליחו להשתמש בקלות. הפילטרים היו מגניבים והתמונות יצאו מעולות.",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1048&auto=format&fit=crop",
    stars: 4
  },
  {
    name: "דנה",
    eventType: "אירוע חברה",
    quote: "השתמשנו במערכת עבור אירוע חברה גדול וזה היה הצלחה מסחררת. היכולת לשתף מדיה בזמן אמת הפכה את האירוע לחוויה אינטראקטיבית.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=987&auto=format&fit=crop",
    stars: 5
  }
];

export default function Testimonials() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.eventType}</p>
                </div>
              </div>
              <div className="flex">
                {Array(testimonial.stars).fill(0).map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="text-gray-600">"{testimonial.quote}"</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}