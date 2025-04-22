import React from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const MOMENT_TYPES = {
  ceremony: 'טקס',
  dance: 'ריקודים',
  food: 'אוכל',
  family: 'משפחה',
  friends: 'חברים',
  general: 'רגעים'
};

export default function MomentStories({ posts }) {
  const groupedPosts = posts.reduce((acc, post) => {
    const type = post.moment_type || 'general';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(post);
    return acc;
  }, {});

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 p-4">
        {Object.entries(groupedPosts).map(([type, posts]) => (
          <div key={type} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] cursor-pointer">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={posts[0]?.media_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs mt-2 text-white">
              {MOMENT_TYPES[type]}
            </span>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}