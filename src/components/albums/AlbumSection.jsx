import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AlbumSection({ title, posts, faceTags }) {
  const scrollRef = React.useRef(null);
  
  if (!posts || posts.length === 0) {
    return null;
  }
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={scrollLeft}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={scrollRight}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <ScrollArea ref={scrollRef} className="w-full" orientation="horizontal">
          <div className="flex gap-4 pb-4">
            {posts.map((post) => {
              // Find face tags for this post
              const postTags = faceTags.filter(tag => tag.post_id === post.id);
              
              return (
                <div key={post.id} className="relative shrink-0 w-64 overflow-hidden rounded-lg">
                  <div className="aspect-square overflow-hidden">
                    {post.type === 'photo' ? (
                      <img
                        src={post.media_url}
                        alt=""
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        style={{ filter: post.filter || 'none' }}
                      />
                    ) : (
                      <video
                        src={post.media_url}
                        className="w-full h-full object-cover"
                        style={{ filter: post.filter || 'none' }}
                      />
                    )}
                    
                    {/* Face Rectangles */}
                    {postTags.map((tag, i) => (
                      <div 
                        key={i}
                        className="absolute border-2 border-purple-500 z-10"
                        style={{
                          left: `${tag.bounding_box.x * 100}%`,
                          top: `${tag.bounding_box.y * 100}%`,
                          width: `${tag.bounding_box.width * 100}%`,
                          height: `${tag.bounding_box.height * 100}%`,
                        }}
                      >
                        {tag.person_name && (
                          <span className="absolute -bottom-6 left-0 right-0 bg-purple-500 text-white text-xs py-1 px-2 text-center truncate">
                            {tag.person_name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}