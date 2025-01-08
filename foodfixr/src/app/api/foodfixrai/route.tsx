import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { database } from '@/app/appwrite';
import { Query } from 'appwrite';

export async function POST(request: Request) {
  try {
    const { userId, category, data } = await request.json();

    if (!userId || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and category' },
        { status: 400 }
      );
    }

    // Generate a timestamp-based suffix
    const timestamp = Date.now();
    const shortUserId = userId.slice(-8); // Take last 8 characters of userId
    
    // Create a document ID that combines userId, category, and timestamp
    const documentId = `${shortUserId}_${category}_${timestamp}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_'); // Replace any invalid characters with underscore

    // Add documentId and threadId to the webhook data
    const webhookData = {
      ...data,
      documentId,
      threadId: documentId, // Use same ID for both document and thread
      category,
      timestamp: new Date(timestamp).toISOString(),
      surveyResponses: data.surveyResponses
    };

    console.log('Making request to external API with:', {
      documentId,
      category,
      timestamp: webhookData.timestamp
    });

    // Make request to external API
    const response = await fetch('https://api.craftthefuture.xyz/webhook-test/foodfixr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      throw new Error(`Failed to send data to external API: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('External API response:', responseData);

    return NextResponse.json({ 
      success: true,
      documentId,
      threadId: documentId,
      data: responseData 
    });

  } catch (error) {
    console.error('Error in foodfixrai route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

