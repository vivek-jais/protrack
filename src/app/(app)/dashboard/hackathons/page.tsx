"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, Code2, Trophy } from "lucide-react";

// Import our hardcoded JSON data
import hackathonsData from "@/data/hackathons.json";

export default function HackathonsPage() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white p-6 font-sans transition-colors duration-200">
      
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center justify-center">
            <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Hackathons</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Discover and apply to upcoming coding competitions.</p>
          </div>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathonsData.map((hackathon) => (
          <div 
            key={hackathon.id} 
            className="group bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
          >
            {/* Poster Image Container */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-zinc-900">
              <Image 
                src={hackathon.image} 
                alt={hackathon.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                  hackathon.status === 'Live' 
                    ? 'bg-red-500/80 text-white border-red-400/50 animate-pulse'
                    : 'bg-black/50 text-white border-white/20'
                }`}>
                  {hackathon.status === 'Live' ? '🔴 LIVE NOW' : hackathon.status}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="mb-4">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">
                  {hackathon.organization}
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                  {hackathon.title}
                </h3>
              </div>

              {/* Meta Info */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>{hackathon.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                  <MapPin className="h-4 w-4" />
                  <span>{hackathon.mode}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                {hackathon.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-[#09090b] border border-gray-200 dark:border-zinc-800 rounded-md text-[11px] font-medium text-gray-600 dark:text-zinc-400"
                  >
                    <Code2 className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Apply Button */}
              <Link 
                href={hackathon.applyLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
              >
                Apply Now
                <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}