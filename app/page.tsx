'use client';

import { useRouter } from 'next/navigation';
import CardSwap, { Card } from '../components/CardSwap';
import TextType from '../components/TextType';

export default function Landing() {
  const router = useRouter();

  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-hidden font-playfair">
      <div className="max-w-7xl mx-auto px-8 w-full h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-1">
          {/* Left Section - Text Content */}
          <div className="text-center lg:text-left flex flex-col justify-center">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-black tracking-tight leading-tight">
                <TextType
                  text={["Lead generation has never been so easy"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                  loop={false}
                />
              </h1>
              <p className="text-2xl text-gray-600 leading-relaxed text-center">
                Just look at it go!
              </p>

              {/* Buttons right below the paragraph */}
              <div className="flex justify-center lg:justify-center gap-4 mt-4">
                <button
                  onClick={() => router.push('/onboarding')}
                  className="px-8 py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Get Started
                </button>
                <button
                  onClick={() => router.push('/home')}
                  className="px-8 py-4 bg-white text-black font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>


          {/* Right Section - Card Stack */}
          <div className="flex justify-center lg:justify-end items-center mt-50 ml-10">
            <div className="relative" style={{ width: '600px', height: '500px' }}>
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
              >
                <Card>
                  <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center h-full">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <h3 className="text-2xl font-bold text-white">Reliable</h3>
                    </div>
                    <div className="text-6xl font-bold text-white">1</div>
                  </div>
                </Card>

                <Card>
                  <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center h-full">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded-full"></div>
                      <h3 className="text-2xl font-bold text-white">Smooth</h3>
                    </div>
                    <div className="text-6xl font-bold text-white">2</div>
                  </div>
                </Card>

                <Card>
                  <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center h-full">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      <h3 className="text-2xl font-bold text-white">Customizable</h3>
                    </div>
                    <div className="text-6xl font-bold text-white">3</div>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}