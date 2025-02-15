"use server"


import { NextResponse } from 'next/server';
import {  account } from '@/app/appwrite';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password and username are required' },
        { status: 400 }
      );
    }

    const myHeaders = new Headers();
    if (!process.env.NEXT_PUBLIC_CROSSMINT_API_KEY) {
      throw new Error('NEXT_PUBLIC_CROSSMINT_API_KEY is not defined');
    }
    myHeaders.append("X-API-KEY", process.env.NEXT_PUBLIC_CROSSMINT_API_KEY);
    myHeaders.append("accept", "application/json");
    myHeaders.append("content-type", "application/json");

    const raw = JSON.stringify({
      chain: "base-sepolia", 
      email: email
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch("https://staging.crossmint.com/api/v1-alpha1/wallets", requestOptions);
    const result = await response.json();

    // Create a compliant user ID by removing '0x' prefix and limiting length
    const cleanPublicKey = result.publicKey.replace('0x', '').toLowerCase();
    const uniqueId = `ff${cleanPublicKey.slice(0, 34)}`; // 'ff' + 34 chars = 36 total chars
    
    try {
      await account.create(uniqueId, email, password, username);
      
      // Create email password session after successful account creation
      await account.createEmailPasswordSession(email, password);

      // const result = await account.get();
      // console.log(result);

      const successResponse = {
        success: true,
        publicKey: result.publicKey,
        uniqueId: uniqueId,
        redirectUrl: '/account-setup'
      };
      return NextResponse.json(successResponse, { status: 200 });

    } catch (appwriteError: unknown) {
      const errorMessage = appwriteError instanceof Error ? appwriteError.message : 'Unknown error';
      
      if (errorMessage.includes('A user with the same id, email, or phone already exists in this project.')) {
        return NextResponse.json({ 
          error: 'Account already exists',
          message: 'An account with this email already exists. Please try logging in instead.'
        }, { status: 409 });
      }

      const errorResponse = { 
        error: 'Failed to create account', 
        message: errorMessage
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

  } catch (error) {
    const serverErrorResponse = { 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
    return NextResponse.json(serverErrorResponse, { status: 500 });
  }
}
