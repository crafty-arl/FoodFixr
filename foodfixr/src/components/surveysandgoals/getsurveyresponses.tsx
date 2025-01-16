'use client';

import { useEffect, useState } from 'react';
import { Query, Models } from 'appwrite';
import { databases } from '@/lib/appwrite-config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { Progress } from "@/components/ui/progress";
import { SurveyCategory } from '@/lib/constants';

interface Response extends Models.Document {
  userid: string;
  questionid: string;
  surveytaken: string;
  survey_pts: number;
  selectedAnswer: string;
  category: string;
  question: string;
}

interface GetSurveyResponsesProps {
  userId: string | null;
  categories: SurveyCategory[];
}

const GetSurveyResponses = ({ userId, categories }: GetSurveyResponsesProps) => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Group responses by category
  const responsesByCategory = responses.reduce((acc, response) => {
    const category = response.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(response);
    return acc;
  }, {} as { [key: string]: Response[] });

  useEffect(() => {
    const fetchResponses = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await databases.listDocuments(
          'foodfixrdb',
          'user_surveryquestions_log',
          [
            Query.equal('userid', userId),
            Query.orderDesc('surveytaken'),
            Query.limit(1000),
          ]
        );

        setResponses(response.documents as unknown as Response[]);
      } catch (error) {
        console.error('Error fetching responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponses();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006666]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#006666] mb-6">Survey History</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(category => {
          const categoryResponses = responsesByCategory[category.name] || [];
          const totalQuestions = category.questionCount || 0;
          const answeredQuestions = categoryResponses.length;
          const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

          return (
            <Card 
              key={category.name}
              className="overflow-hidden bg-white border-2 border-[#006666] transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
              onClick={() => {
                setSelectedCategory(category.name);
                setShowDialog(true);
              }}
            >
              <CardHeader className="text-center p-2 sm:p-4">
                <CardTitle className="text-base sm:text-lg">
                  {category.name === 'Pre_probiotics' ? 'Pre/Probiotics' : 
                   category.name === 'Gut_BrainHealth' ? 'Gut-Brain Health' : 
                   category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2 sm:gap-4 p-2 sm:p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20">
                  <Image
                    src={category.icon}
                    alt={`${category.name} icon`}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <Progress 
                  value={progress}
                  className="w-full" 
                />
                <div className="text-center mt-1 sm:mt-2">
                  <div className="text-xs sm:text-sm mt-2 font-medium">
                    {answeredQuestions}/{totalQuestions} Questions Completed
                    {totalQuestions > 0 && (
                      <span className="text-gray-500">
                        {' '}({progress.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    {answeredQuestions} Responses
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-xl sm:text-2xl text-[#006666]">
                {selectedCategory} Survey Responses
              </DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {selectedCategory && responsesByCategory[selectedCategory]?.map((response, index) => (
                <Card key={response.$id} className="border-2 border-green-500 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#993366]">Question {index + 1}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Score: {response.survey_pts}/8
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{response.question}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Answer: {response.selectedAnswer}</span>
                        <span>{formatDate(response.surveytaken)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GetSurveyResponses; 