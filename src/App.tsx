/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type ReactNode, type FormEvent } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  Rocket, 
  ShoppingCart, 
  Info, 
  Link as LinkIcon, 
  FileText, 
  Code,
  ChevronUp,
  ExternalLink,
  Github,
  MessageSquare,
  Star,
  Send
} from 'lucide-react';
import { getFirebaseApp, submitFeedback, getRemoteConfigFlags, type RemoteConfigFlags } from './firebase';
import { AdSlot, isAdsEnabled } from './ads';
import { motion, AnimatePresence } from 'motion/react';

const showAmazonEnv =
  import.meta.env.VITE_SHOW_AMAZON !== 'false' && import.meta.env.VITE_SHOW_AMAZON !== '0';

const CHAPTERS = [
  {
    id: 'chapter-1',
    number: '1',
    title: 'What is cross-platform mobile development?',
    description: 'This chapter defines what cross-platform means in practice and which parts of an app are typically shareable (domain, models, networking, and sometimes UI). It presents four approaches to building Android and iOS apps (native, PWA, cross-platform, and hybrid apps), along with their typical advantages and limitations. It closes with a practical decision criterion: choosing a point on the sharing spectrum based on UX, performance, time-to-market, and team capabilities.',
    references: [
      { title: 'Cross-platform and native app development', url: 'https://kotlinlang.org/docs/multiplatform/native-and-cross-platform.html' },
      { title: 'Kotlin Multiplatform – Build Cross-Platform Apps', url: 'https://kotlinlang.org/lp/multiplatform/' },
      { title: 'Netflix Android and iOS Studio Apps', url: 'https://netflixtechblog.com/netflix-android-and-ios-studio-apps-kotlin-multiplatform-d6d4d8d25d23' },
      { title: 'Writing custom platform-specific code', url: 'https://docs.flutter.dev/platform-integration/platform-channels' }
    ]
  },
  {
    id: 'chapter-2',
    number: '2',
    title: 'Introduction to Kotlin Multiplatform',
    description: 'This chapter explains what Kotlin Multiplatform (KMP) is, what problem it solves for teams that maintain Android and iOS in parallel, and how shared code is compiled into native artifacts per platform. It introduces the concept of source sets (for example commonMain, androidMain, iosMain) as the core mechanism for deciding what is shared and what is platform-specific.',
    references: [
      { title: 'Kotlin Multiplatform overview', url: 'http://kotlinlang.org/docs/multiplatform/kmp-overview.html' },
      { title: 'Reasons to try Kotlin Multiplatform', url: 'http://kotlinlang.org/docs/multiplatform/multiplatform-reasons-to-try.html' },
      { title: 'Introduce Kotlin Multiplatform to your team', url: 'http://kotlinlang.org/docs/multiplatform/multiplatform-introduce-your-team.html' }
    ]
  },
  {
    id: 'chapter-3',
    number: '3',
    title: 'Understanding the Basic Structure of a Project',
    description: 'This chapter breaks down the typical structure of a modern KMP project: a shared module with shared logic, an Android module, and an iOS app in Xcode. It explains in depth the difference between targets and source sets, including hierarchies like iosMain to avoid duplication.',
    references: [
      { title: 'Discover Kotlin Multiplatform projects', url: 'https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html' },
      { title: 'Advanced project structure', url: 'https://kotlinlang.org/docs/multiplatform-advanced-project-structure.html' },
      { title: 'Expected and actual declarations', url: 'https://kotlinlang.org/docs/multiplatform-expect-actual.html' },
      { title: 'Kotlin Multiplatform plugin', url: 'https://developer.android.com/kotlin/multiplatform/plugin' }
    ]
  },
  {
    id: 'chapter-4',
    number: '4',
    title: 'First Project in Kotlin Multiplatform',
    description: 'This chapter guides the creation of a first end-to-end KMP project: preparing the environment (Android Studio, JDK, Gradle) and, on macOS, Xcode and iOS simulators. It then shows how to generate the project from a template and write the first shared API using expect/actual.',
    references: [
      { title: 'Kotlin Multiplatform Project Wizard', url: 'https://kmp.jetbrains.com/' },
      { title: 'Kotlin Multiplatform Mobile plugin', url: 'https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform-mobile' },
      { title: 'Jetpack Compose', url: 'https://developer.android.com/jetpack/compose' },
      { title: 'SwiftUI', url: 'https://developer.apple.com/documentation/swiftui' }
    ]
  },
  {
    id: 'chapter-5',
    number: '5',
    title: 'Introduction to Dependency Injection in KMP',
    description: 'This chapter frames DI in KMP as a platform composition problem. It introduces approaches without frameworks and walks through popular KMP options, comparing runtime models (Koin, Kodein) with compile-time alternatives (kotlin-inject and Metro).',
    references: [
      { title: 'Koin', url: 'https://insert-koin.io/' },
      { title: 'Kodein-DI', url: 'https://kosi-libs.org/kodein/7.22/getting-started.html' },
      { title: 'Introducing Metro', url: 'https://www.zacsweers.dev/introducing-metro/' },
      { title: 'DIY your own DI library', url: 'https://blog.p-y.wtf/diy-your-own-dependency-injection-library' }
    ]
  },
  {
    id: 'chapter-6',
    number: '6',
    title: 'Modularization',
    description: 'This chapter explains when to modularize in KMP and when not to. The central part is the "iOS challenge": how to expose a single framework to iOS through an umbrella module that aggregates and exports the necessary modules.',
    references: [
      { title: 'Multiplatform project configuration', url: 'https://kotlinlang.org/docs/multiplatform/multiplatform-project-configuration.html' },
      { title: 'Multiple Kotlin frameworks in application', url: 'https://touchlab.co/multiple-kotlin-frameworks-in-application/' },
      { title: 'Objective-C interop', url: 'https://kotlinlang.org/docs/native-objc-interop.html' },
      { title: 'Do I need an umbrella framework?', url: 'https://www.pamelaahill.com/post/do-i-need-an-umbrella-framework' }
    ]
  },
  {
    id: 'chapter-7',
    number: '7',
    title: 'Testing',
    description: 'Testing shared code is essential as a bug in commonMain affects both platforms. This chapter focuses on unit and integration tests, using test doubles to isolate boundaries like network and storage. It introduces ecosystem tools like Turbine and Mokkery.',
    references: [
      { title: 'kotlin.test', url: 'https://kotlinlang.org/api/latest/kotlin.test/' },
      { title: 'Turbine', url: 'https://github.com/cashapp/turbine' },
      { title: 'Mokkery', url: 'https://github.com/lupuuss/Mokkery' },
      { title: 'MockK', url: 'https://mockk.io/' }
    ]
  },
  {
    id: 'chapter-8',
    number: '8',
    title: 'Integrating Native Dependencies into KMP',
    description: 'When there is no official KMP library, integrating native SDKs behind a common API is a pragmatic approach. This chapter covers integrating iOS dependencies via SwiftPM, CocoaPods, or manual cinterop, using Bugsnag as a case study.',
    references: [
      { title: 'Add Android dependencies', url: 'https://kotlinlang.org/docs/multiplatform/multiplatform-android-dependencies.html' },
      { title: 'Add iOS dependencies', url: 'https://kotlinlang.org/docs/multiplatform/multiplatform-ios-dependencies.html' },
      { title: 'Swift Package Manager support', url: 'https://kotlinlang.org/docs/native-spm.html' },
      { title: 'App Startup', url: 'https://developer.android.com/topic/libraries/app-startup' }
    ]
  },
  {
    id: 'chapter-9',
    number: '9',
    title: 'Designing KMP libraries with native APIs',
    description: 'Designing APIs that feel idiomatic on both Android and iOS. It covers concurrency (suspend and Flow), distribution (Maven Central and XCFramework), and production concerns like framework size and documentation with Dokka.',
    references: [
      { title: 'Expected and actual declarations', url: 'https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-expect-actual.html' },
      { title: 'KMP-NativeCoroutines', url: 'https://github.com/rickclephas/KMP-NativeCoroutines' },
      { title: 'SKIE Suspend functions', url: 'https://skie.touchlab.co/features/suspend-functions' },
      { title: 'Publish KMP libraries', url: 'https://kotlinlang.org/docs/multiplatform-publish-lib.html' }
    ]
  },
  {
    id: 'chapter-10',
    number: '10',
    title: 'Swift Export',
    description: 'Swift Export is an experimental evolution to improve the experience of consuming Kotlin/Native code from Swift, avoiding the classic Objective-C-based model. It details type mapping and how to enable it in Gradle and Xcode.',
    references: [
      { title: 'Swift export documentation', url: 'https://kotlinlang.org/docs/native-swift-export.html' },
      { title: 'Swift export sample', url: 'https://github.com/Kotlin/swift-export-sample' },
      { title: 'Swift export docs (GitHub)', url: 'https://github.com/JetBrains/kotlin/tree/master/docs/swift-export' }
    ]
  },
  {
    id: 'chapter-11',
    number: '11',
    title: 'Libraries',
    description: 'A practical guide to choosing libraries in KMP. It covers Networking (Ktor), Storage (DataStore, Multiplatform Settings), and Structured persistence (SQLDelight, Room).',
    references: [
      { title: 'Ktor Client: Get started', url: 'https://ktor.io/docs/getting-started-ktor-client-multiplatform-mobile.html' },
      { title: 'Multiplatform Settings', url: 'https://github.com/russhwolf/multiplatform-settings' },
      { title: 'SQLDelight', url: 'https://cashapp.github.io/sqldelight/2.0.1/' },
      { title: 'Klibs.io', url: 'https://klibs.io/' }
    ]
  },
  {
    id: 'chapter-12',
    number: '12',
    title: 'Essential Tools and Plugins',
    description: 'A tooling map to reduce friction in KMP, focusing on environment setup, iOS developer experience, and industrialization. It covers KDoctor, SKIE, KMMBridge, and xcode-kotlin.',
    references: [
      { title: 'KDoctor', url: 'https://github.com/Kotlin/kdoctor' },
      { title: 'SKIE', url: 'https://skie.touchlab.co/intro' },
      { title: 'KMMBridge', url: 'https://kmmbridge.touchlab.co/docs/' },
      { title: 'xcode-kotlin', url: 'https://github.com/touchlab/xcode-kotlin' }
    ]
  }
];

const LEANPUB_URL = 'https://leanpub.com/kmp-for-mobile-native-developers';

const REPOSITORIES = [
  { title: 'Book Sample App', url: 'https://github.com/santimattius/kmp-for-mobile-native-developers' },
  { title: 'KMP Native API Playground', url: 'https://github.com/santimattius/kmp-native-api-playground' },
  { title: 'KMP for Native Clients', url: 'https://github.com/santimattius/kmp-for-native-clients' },
  { title: 'Compose Multiplatform Delivery App', url: 'https://github.com/santimattius/cmp-delivery-application' },
  { title: 'KMP Compose Gradle Skeleton', url: 'https://github.com/santimattius/kmp-compose-gradle-skeleton' }
];

export default function App() {
  const [isChaptersOpen, setIsChaptersOpen] = useState(false);
  const [remoteFlags, setRemoteFlags] = useState<RemoteConfigFlags | null>(null);

  useEffect(() => {
    getRemoteConfigFlags().then((flags) => {
      if (flags) setRemoteFlags(flags);
    });
  }, []);

  const showAmazon = remoteFlags?.showAmazon ?? showAmazonEnv;
  const adsEnabled = remoteFlags?.adsEnabled ?? isAdsEnabled();

  return (
    <div className="min-h-screen bg-background-light text-slate-900 font-sans selection:bg-primary/20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary w-8 h-8" />
            <h2 className="text-lg font-bold tracking-tight hidden md:block">KMP for Mobile Native Developers</h2>
          </div>
          <nav className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-6">
              <a href="#introduction" className="text-sm font-medium hover:text-primary transition-colors">Introduction</a>
              <div className="relative group">
                <button 
                  onMouseEnter={() => setIsChaptersOpen(true)}
                  onMouseLeave={() => setIsChaptersOpen(false)}
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                >
                  Chapters
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {isChaptersOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseEnter={() => setIsChaptersOpen(true)}
                      onMouseLeave={() => setIsChaptersOpen(false)}
                      className="absolute top-full -left-4 w-64 bg-white shadow-xl border border-slate-200 rounded-lg py-2 max-h-[80vh] overflow-y-auto"
                    >
                      {CHAPTERS.map((chapter) => (
                        <a 
                          key={chapter.id} 
                          href={`#${chapter.id}`} 
                          className="block px-4 py-2 text-sm hover:bg-slate-50 truncate"
                          onClick={() => setIsChaptersOpen(false)}
                        >
                          {chapter.number}. {chapter.title}
                        </a>
                      ))}
                      <div className="border-t border-slate-100 my-1"></div>
                      <a href="#table-of-contents" className="block px-4 py-2 text-sm font-semibold text-primary">View All Chapters</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <a href="#feedback" className="text-sm font-medium hover:text-primary transition-colors">Feedback</a>
              <a href="#repositories" className="text-sm font-medium hover:text-primary transition-colors">Repositories</a>
            </div>
            <div className="flex items-center gap-3">
              {showAmazon && (
                <button className="hidden sm:inline-flex bg-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors">
                  Buy on Amazon
                </button>
              )}
              <a
                href={LEANPUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                Get on Leanpub
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">New Release 2026</span>
              <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
                KMP for Mobile Native Developers
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Master Kotlin Multiplatform for modern mobile native development. Build shared logic across iOS and Android with ease without sacrificing native performance.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={LEANPUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-8 bg-primary text-white rounded-xl text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                Get on Leanpub <Rocket className="w-5 h-5" />
              </a>
              {showAmazon && (
                <button className="h-14 px-8 bg-white border border-slate-200 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                  Buy on Amazon <ShoppingCart className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden group">
              <img 
                src="/book-cover.png" 
                alt="KMP for Mobile Native Developers Book Cover" 
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                <p className="text-sm font-medium opacity-80 uppercase tracking-widest">A comprehensive guide</p>
                <p className="text-2xl font-bold">The definitive KMP handbook</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Introduction Section */}
        <section id="introduction" className="max-w-3xl mx-auto mb-32 scroll-mt-24">
          <div className="flex items-center gap-3 text-primary mb-4">
            <Info className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-sm">Introduction</h3>
          </div>
          <h2 className="text-3xl font-bold mb-6">A new era for native development</h2>
          <div className="prose prose-lg text-slate-600 space-y-6">
            <p>
              Building mobile software today means balancing two opposing forces. On one side, the need for <strong>speed and consistency</strong> across platforms as products grow, teams scale, and business rules must behave the same way on Android and iOS. On the other, the need to stay truly native, with polished experiences, idiomatic APIs on each platform, and technical decisions that do not compromise long-term quality.
            </p>
            <p>
              <strong>Kotlin Multiplatform (KMP)</strong> sits right at that intersection. Not as a “write once and forget” promise, but as a pragmatic approach to <strong>sharing logic where it makes sense</strong> while keeping <strong>native UIs</strong>, raising the architectural bar instead of lowering it.
            </p>
            <p>
              This book is written for <strong>mobile developers</strong> with experience in <strong>Kotlin/Android</strong> or <strong>Swift/iOS</strong> who want to adopt KMP seriously and sustainably. It proposes a journey that combines principles and practice: <strong>when KMP makes sense</strong>, how to adopt it <strong>incrementally</strong>, and how to make solid decisions about project structure, modularization, and distribution.
            </p>
          </div>
        </section>

        {/* Table of Contents */}
        <section id="table-of-contents" className="mb-32 scroll-mt-24">
          <h2 className="text-4xl font-black mb-12 text-center">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHAPTERS.map((chapter) => (
              <a 
                key={chapter.id}
                href={`#${chapter.id}`} 
                className="p-6 bg-white border border-slate-200 rounded-xl hover:border-primary transition-all group"
              >
                <span className="text-primary font-bold block mb-2">Chapter {chapter.number}</span>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{chapter.title}</h3>
              </a>
            ))}
          </div>
        </section>

        {/* Publicidad (después del índice) */}
        {adsEnabled && (
          <section className="max-w-4xl mx-auto mb-16" aria-label="Publicidad">
            <p className="text-center text-xs text-slate-400 mb-2">Publicidad</p>
            <div className="flex justify-center min-h-[100px] py-4">
              <AdSlot className="min-h-[90px]" format="auto" />
            </div>
          </section>
        )}

        {/* Detailed Chapters */}
        <section className="space-y-16 max-w-4xl mx-auto mb-32">
          {CHAPTERS.map((chapter) => (
            <Chapter 
              key={chapter.id}
              id={chapter.id}
              number={chapter.number}
              title={chapter.title}
              description={chapter.description}
              references={chapter.references.map((ref): Reference => ({
                title: ref.title,
                url: ref.url,
                icon: <FileText className="w-4 h-4" />
              }))}
            />
          ))}
        </section>

        {/* Publicidad (antes de Feedback) */}
        {adsEnabled && (
          <section className="max-w-2xl mx-auto mb-16" aria-label="Publicidad">
            <p className="text-center text-xs text-slate-400 mb-2">Publicidad</p>
            <div className="flex justify-center min-h-[100px] py-4">
              <AdSlot className="min-h-[90px]" format="auto" />
            </div>
          </section>
        )}

        {/* Feedback Section */}
        <section id="feedback" className="scroll-mt-24 max-w-2xl mx-auto mb-32">
          <div className="flex items-center gap-3 text-primary mb-4">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-sm">Feedback</h3>
          </div>
          <h2 className="text-3xl font-bold mb-2">What do you think?</h2>
          <p className="text-slate-600 mb-8">
            Your opinion helps us improve. Leave a comment about the book or the site.
          </p>
          <FeedbackForm />
        </section>

        {/* Final CTA & Repositories Section */}
        <section id="repositories" className="scroll-mt-24 p-12 bg-primary rounded-3xl text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-800 opacity-50"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-black">Ready to level up?</h2>
            <p className="text-xl text-blue-100">
              Get access to in-depth technical content, practical code samples, and ongoing community updates.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={LEANPUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-10 bg-white text-primary rounded-xl text-lg font-bold hover:bg-slate-100 transition-all shadow-xl"
              >
                Get on Leanpub
              </a>
              {showAmazon && (
                <button className="h-14 px-10 bg-primary border-2 border-white/30 text-white rounded-xl text-lg font-bold hover:bg-white/10 transition-all">
                  Buy on Amazon
                </button>
              )}
            </div>
            <div className="pt-12 mt-12 border-t border-white/10 flex flex-col items-center gap-6">
              <h3 className="text-xl font-bold">Open Source Repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {REPOSITORIES.map((repo, i) => (
                  <a 
                    key={i} 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-left group"
                  >
                    <Github className="w-6 h-6 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{repo.title}</p>
                      <p className="text-xs text-blue-200 truncate">{repo.url.replace('https://', '')}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-500 text-sm">
          © 2026 Kotlin Multiplatform for Native Developers. All rights reserved. <br className="md:hidden"/>
          Built with Inter and Lucide Icons.
        </p>
      </footer>
    </div>
  );
}

function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const firebaseReady = Boolean(getFirebaseApp());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      await submitFeedback({
        message: message.trim(),
        ...(author.trim() && { author: author.trim() }),
        ...(rating > 0 && { rating }),
      });
      setMessage('');
      setAuthor('');
      setRating(0);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (!firebaseReady) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm">
        Feedback is not configured for this environment. To enable it, set up Firebase (see docs).
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="feedback-message" className="block text-sm font-medium text-slate-700 mb-1">
          Your feedback <span className="text-red-500">*</span>
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What did you like? What could be better?"
          required
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
          disabled={status === 'sending'}
        />
      </div>
      <div>
        <label htmlFor="feedback-author" className="block text-sm font-medium text-slate-700 mb-1">
          Name or handle <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          id="feedback-author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="How we can credit you"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
          disabled={status === 'sending'}
        />
      </div>
      <div>
        <span className="block text-sm font-medium text-slate-700 mb-2">Rating (optional)</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 text-slate-300 hover:text-amber-400 focus:text-amber-400 focus:outline-none disabled:opacity-50"
              disabled={status === 'sending'}
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
            >
              <Star
                className="w-7 h-7 fill-current"
                style={{
                  color: (hoverRating || rating) >= value ? 'rgb(251 191 36)' : undefined,
                }}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending' || !message.trim()}
          className="inline-flex items-center gap-2 h-12 px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? (
            'Sending…'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send feedback
            </>
          )}
        </button>
        {status === 'success' && (
          <span className="text-green-600 font-medium">Thanks! Your feedback was sent.</span>
        )}
        {status === 'error' && (
          <span className="text-red-600 font-medium">Something went wrong. Please try again.</span>
        )}
      </div>
    </form>
  );
}

interface Reference {
  title: string;
  url: string;
  icon: ReactNode;
}

interface ChapterProps {
  key?: string | number;
  id: string;
  number: string;
  title: string;
  description: string;
  references: Reference[];
}

function Chapter(props: ChapterProps) {
  const { id, number, title, description, references } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article id={id} className="scroll-mt-32 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-primary uppercase tracking-tighter">Chapter {number}</h4>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>
      <h3 className="text-3xl font-bold mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed mb-8">
        {description}
      </p>
      <div className="border-t border-slate-100 pt-6">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span>VIEW CHAPTER REFERENCES ({references.length})</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {references.map((ref, i) => (
                  <a 
                    key={i} 
                    href={ref.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg text-sm hover:text-primary transition-colors group"
                  >
                    {ref.icon}
                    <span className="flex-1 truncate">{ref.title}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
