import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite-config';

export async function POST(request: Request) {
  console.log('🎯 WEBHOOK ROUTE TRIGGERED - /api/webhooks', new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log('📥 Received webhook:', {
      task: body.task,
      userId: body.userId,
      surveyResponseCount: body.surveyResponses?.length,
      categoryScoresCount: Object.keys(body.categoryScores || {}).length
    });
    
    // Validate that this is a valid webhook task
    const validTasks = ['initial_survey_completion', 'generate_surveys', 'generate_goals'];
    const validTaskTypes = ['generate_grocery_list'];
    
    if (!validTasks.includes(body.task) && !validTaskTypes.includes(body.task?.type)) {
      console.warn('❌ Invalid webhook task:', body.task);
      return NextResponse.json(
        { error: 'Invalid webhook task' },
        { status: 400 }
      );
    }

    // Different validation based on task type
    if (body.task === 'initial_survey_completion') {
      if (!body.userId || !body.surveyResponses || !body.userProfile) {
        console.warn('❌ Missing required fields for survey completion:', {
          hasUserId: !!body.userId,
          hasSurveyResponses: !!body.surveyResponses,
          hasUserProfile: !!body.userProfile
        });
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
    } else if (body.task === 'generate_surveys') {
      if (!body.userId || !body.userProfile || !body.categoryScores || !body.surveyResponses) {
        console.warn('❌ Missing required fields for survey generation:', {
          hasUserId: !!body.userId,
          hasUserProfile: !!body.userProfile,
          hasCategoryScores: !!body.categoryScores,
          hasSurveyResponses: !!body.surveyResponses
        });
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
    } else if (body.task?.type === 'generate_grocery_list') {
      if (!body.userId || !body.userProfile) {
        console.warn('❌ Missing required fields for grocery list generation:', {
          hasUserId: !!body.userId,
          hasUserProfile: !!body.userProfile
        });
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
    } else if (body.task === 'generate_goals') {
      if (!body.userId || !body.userProfile || !body.categoryScores || !body.category || !body.score) {
        console.warn('❌ Missing required fields for goal generation:', {
          hasUserId: !!body.userId,
          hasUserProfile: !!body.userProfile,
          hasCategoryScores: !!body.categoryScores,
          hasCategory: !!body.category,
          hasScore: !!body.score
        });
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
    }

    console.log('🔄 Forwarding to Craft the Future...');
    
    // Prepare payload based on task type
    const craftPayload = {
      event: body.task?.type || body.task,
      data: {
        userId: body.userId,
        task: body.task,
        category: body.category,
        score: body.score,
        description: body.task?.description || body.description,
        userProfile: body.userProfile,
        surveyResponses: body.surveyResponses,
        categoryScores: body.categoryScores,
        surveyData: body.surveyData,
        requestedAt: body.requestedAt || new Date().toISOString()
      }
    };

    console.log('📦 Craft the Future Payload:', {
      event: craftPayload.event,
      dataFields: Object.keys(craftPayload.data),
      surveyResponseCount: craftPayload.data.surveyResponses?.length,
      categoryCount: Object.keys(craftPayload.data.categoryScores || {}).length
    });
    
    // Forward the webhook data to Craft the Future
    console.log('📤 Sending to Craft the Future:', {
      url: 'https://api.craftthefuture.xyz/webhook/15d621fe-55bd-4066-a8cd-26a6b84f3ade',
      payload: craftPayload
    });
    
    const craftResponse = await fetch('https://api.craftthefuture.xyz/webhook/15d621fe-55bd-4066-a8cd-26a6b84f3ade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(craftPayload)
    });

    if (!craftResponse.ok) {
      const errorText = await craftResponse.text();
      console.error('❌ Craft the Future webhook failed:', {
        status: craftResponse.status,
        statusText: craftResponse.statusText,
        error: errorText,
        payload: craftPayload
      });
      throw new Error(`Webhook forwarding failed with status: ${craftResponse.status} - ${errorText}`);
    }

    const craftResult = await craftResponse.json();
    console.log('✅ Craft the Future response:', craftResult);
    
    // Handle different response formats based on task type
    let responseMessage = body.task?.type || body.task;
    let responseData = craftResult;

    // If it's a grocery list response, format it appropriately
    if (body.task?.type === 'generate_grocery_list' && craftResult.output?.ingredients) {
      responseData = {
        ingredients: craftResult.output.ingredients,
        message: 'Grocery list generated successfully'
      };
      responseMessage = 'Grocery list generated';
    }
    
    // Save goals to database if this was a goal generation task
    if (body.task === 'generate_goals' && craftResult.output) {
      try {
        console.log('💾 Saving goals to database...', craftResult.output);
        
        interface GoalOutput {
          goal: string;
          benefit: string;
          tips: string;
        }
        
        // Format goals array to match schema
        const formattedGoals = Array.isArray(craftResult.output) 
          ? craftResult.output.map((goal: string | GoalOutput) => 
              typeof goal === 'string' 
                ? goal 
                : `Goal: ${goal.goal}\nBenefit: ${goal.benefit}\nTips: ${goal.tips}\nCompleted: false`
            )
          : [craftResult.output].map((goal: string | GoalOutput) => 
              typeof goal === 'string'
                ? goal
                : `Goal: ${goal.goal}\nBenefit: ${goal.benefit}\nTips: ${goal.tips}\nCompleted: false`
            );

        console.log('📝 Formatted goals:', formattedGoals);
        
        const goalsDocument = await databases.createDocument(
          'foodfixrdb',
          'food_fixr_ai_logs',
          'unique()',
          {
            userid: body.userId,
            category: body.category,
            goals: formattedGoals,
            date_goals_generated: new Date().toISOString(),
            isCompleted: false
          }
        );
        
        console.log('✅ Goals saved successfully:', {
          documentId: goalsDocument.$id,
          category: body.category,
          goalsCount: formattedGoals.length,
          goals: formattedGoals
        });
        
        responseData = {
          ...craftResult,
          savedGoals: {
            documentId: goalsDocument.$id,
            goals: formattedGoals
          }
        };
      } catch (error: unknown) {
        const dbError = error as Error;
        console.error('❌ Failed to save goals to database:', dbError);
        console.error('Error details:', {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack
        });
        // Continue execution even if save fails
      }
    }
    
    return NextResponse.json({
      message: `${responseMessage} webhook processed successfully`,
      status: 'success',
      webhookResponse: responseData
    }, { status: 200 });

  } catch (error) {
    console.error('💥 Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process or forward webhook' },
      { status: 500 }
    );
  }
}