'use client';

import { useEffect, useState } from 'react';
import { Query, Models } from 'appwrite';
import { databases } from '@/lib/appwrite-config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SurveyCategory } from '@/lib/constants';
import { ListGoals } from './listgoals';

interface Question {
  $id: string;
  Question: string;
  Why: string;
  absolutely: number;
  moderate_for_sure: number;
  sort_of: number;
  barely_or_rarely: number;
  never_ever: number;
  QuestionType: string;
}

interface Response extends Models.Document {
  userid: string;
  questionid: string;
  surveytaken: string;
  survey_pts: number;
  selectedAnswer: string;
  category: string;
  question: string;
}

interface GetCategoryProps {
  userId: string | null;
  category: SurveyCategory;
}

const GetCategory = ({ userId, category }: GetCategoryProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [showDialog, setShowDialog] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !category?.name) return;

      try {
        setIsLoading(true);
        
        // Fetch questions
        const questionsResponse = await databases.listDocuments(
          'foodfixrdb',
          'risk_assesment_questions',
          [
            Query.equal('QuestionType', category.name),
            Query.orderDesc('$createdAt'),
            Query.limit(100),
          ]
        );

        // Fetch responses
        const responsesResponse = await databases.listDocuments(
          'foodfixrdb',
          'user_surveryquestions_log',
          [
            Query.equal('userid', userId),
            Query.equal('category', category.name),
            Query.orderDesc('surveytaken'),
            Query.limit(1000),
          ]
        );

        setQuestions(questionsResponse.documents as unknown as Question[]);
        setResponses(responsesResponse.documents as unknown as Response[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, category?.name]);

  // Add function to check if all questions are answered
  const areAllQuestionsAnswered = () => {
    const unansweredQuestions = questions.filter(question => 
      !responses.some(r => r.questionid === question.$id) && 
      !selectedAnswers[question.$id]
    );
    return unansweredQuestions.length === 0;
  };

  const handleSubmitSurvey = async () => {
    if (!userId || !areAllQuestionsAnswered()) return;
    
    try {
      setIsSubmitting(true);

      // Submit each answer
      const newResponses = await Promise.all(
        Object.entries(selectedAnswers).map(async ([questionId, answer]) => {
          const question = questions.find(q => q.$id === questionId);
          if (!question) return null;

          let score = 0;
          switch (answer) {
            case 'absolutely': score = question.absolutely; break;
            case 'moderate_for_sure': score = question.moderate_for_sure; break;
            case 'sort_of': score = question.sort_of; break;
            case 'barely_or_rarely': score = question.barely_or_rarely; break;
            case 'never_ever': score = question.never_ever; break;
          }

          const result = await databases.createDocument(
            'foodfixrdb',
            'user_surveryquestions_log',
            'unique()',
            {
              userid: userId,
              questionid: question.$id,
              surveytaken: new Date().toISOString(),
              survey_pts: score,
              selectedAnswer: answer,
              category: question.QuestionType,
              question: question.Question
            }
          );

          return {
            $id: result.$id,
            userid: result.userid,
            questionid: result.questionid,
            surveytaken: result.surveytaken,
            survey_pts: result.survey_pts,
            selectedAnswer: result.selectedAnswer,
            category: result.category,
            question: result.question
          } as Response;
        })
      );

      // Update responses state with new valid responses
      const validNewResponses = newResponses.filter((r): r is Response => r !== null);
      setResponses(prev => [...prev, ...validNewResponses]);

      // Clear selected answers and close dialog
      setSelectedAnswers({});
      setShowDialog(false);

    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  // Calculate completion stats
  const totalQuestions = questions.length;
  const completedQuestions = responses.length;
  const remainingQuestions = totalQuestions - completedQuestions;
  const completionPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006666]"></div>
      </div>
    );
  }

  return (
    <>
      <Card 
        className="overflow-hidden bg-white border-2 border-[#006666] transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer relative"
        onClick={() => setShowDialog(true)}
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
            value={completionPercentage}
            className="w-full" 
          />
          <div className="text-center mt-1 sm:mt-2">
            <div className="text-xs sm:text-sm mt-2 font-medium">
              {completedQuestions}/{totalQuestions} Questions Completed
              <span className="text-gray-500">
                {' '}({completionPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="flex gap-2 justify-center mt-2">
              {completedQuestions > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {completedQuestions} Completed
                </Badge>
              )}
              {remainingQuestions > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {remainingQuestions} Remaining
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-xl sm:text-2xl text-[#006666]">
                {category.name} Survey
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {completedQuestions} Completed
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {remainingQuestions} Remaining
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="incomplete" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="incomplete">
                Remaining Questions ({remainingQuestions})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed Questions ({completedQuestions})
              </TabsTrigger>
              <TabsTrigger value="goals">
                Goals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incomplete" className="mt-4">
              <div className="space-y-4">
                {!areAllQuestionsAnswered() && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Please answer all questions before submitting the survey.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {questions
                    .filter(question => !responses.some(r => r.questionid === question.$id))
                    .map((question, index) => (
                      <Card 
                        key={question.$id} 
                        className={`border-2 ${
                          selectedAnswers[question.$id] 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-[#006666]'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-4 mb-6 text-center">
                              <div className="flex-shrink-0 p-3 rounded-full bg-[#006666]/10">
                                <div className="w-12 h-12">
                                  <Image
                                    src={category.icon}
                                    alt={category.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-contain"
                                    priority
                                  />
                                </div>
                              </div>
                              <div className="text-center">
                                <h3 className="font-medium text-[#993366] text-base mb-2">
                                  Question {index + 1}
                                  {selectedAnswers[question.$id] && (
                                    <span className="ml-2 text-green-600">✓</span>
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground">{question.Question}</p>
                              </div>
                            </div>

                            <RadioGroup
                              value={selectedAnswers[question.$id] || ''}
                              onValueChange={(value) => {
                                setSelectedAnswers(prev => ({
                                  ...prev,
                                  [question.$id]: value
                                }));
                              }}
                              className="flex justify-center gap-4 flex-wrap"
                            >
                              {[
                                { label: 'Absolutely', value: 'absolutely' },
                                { label: 'Moderate For Sure', value: 'moderate_for_sure' },
                                { label: 'Sort of', value: 'sort_of' },
                                { label: 'Barely or Rarely', value: 'barely_or_rarely' },
                                { label: 'Never Ever', value: 'never_ever' }
                              ].map((option) => (
                                <div key={option.value} className="flex items-center gap-2">
                                  <RadioGroupItem value={option.value} id={`${question.$id}-${option.value}`} />
                                  <Label 
                                    htmlFor={`${question.$id}-${option.value}`}
                                    className="text-sm text-muted-foreground whitespace-nowrap"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {questions.length > 0 && (
                  <div className="sticky bottom-4 flex justify-center pt-4 mt-8 border-t">
                    <Button 
                      className="bg-[#006666] hover:bg-[#005555] disabled:bg-gray-300 w-full sm:w-auto"
                      onClick={handleSubmitSurvey}
                      disabled={!areAllQuestionsAnswered() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="opacity-0">Submit Survey</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <>
                          Submit Survey ({Object.keys(selectedAnswers).length}/{questions.filter(q => !responses.some(r => r.questionid === q.$id)).length})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {responses.map((response, index) => (
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
            </TabsContent>

            <TabsContent value="goals" className="mt-4">
              <ScrollArea className="h-[60vh]">
                {userId && (
                  <ListGoals 
                    userId={userId}
                    category={category.name}
                    onGoalComplete={() => {
                      // Refresh data when a goal is completed
                      if (onGoalComplete) {
                        onGoalComplete();
                      }
                    }}
                  />
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GetCategory; 