import React, { useState, useEffect, useRef  } from 'react';
import { 
    FileText, Search, Clock, CheckCircle, AlertTriangle, Upload, 
    Send, Phone, MessageCircle, ArrowLeft, Home, Plus, Eye, 
    Train, ChevronDown, Activity, Star, Bell, Settings,
    Calendar, User, Filter, Download, Share2, ExternalLink,
    Zap, Shield, Globe, TrendingUp, Award, Heart, Mail,MessageSquare, BookOpen , X 
     
     
} from 'lucide-react';
import { 
    CATEGORY_KEYWORDS, 
    ANALYSIS_CONFIG, 
    PRIORITY_WEIGHTS, 
    DEFAULT_ASSIGNMENTS 
} from './constants';
import GuidelinesPage from './GuidelinesPage';
import StaffLoginPage from './staff';
import logo from './logo.png';
import railwayImage from './image.png';
import railwayImageBW from './pexels-raj-photography-83911134-20402113.jpg';
import railwayImage1 from './pexels-thangpu-paite-3365148-13110584.jpg';
import { submitComplaint, getComplaintsByContact, getComplaintById } from './services/complaintService';


// ++++++++++++++++++++=alternate algo++++++++++++++++++++
// const analyzeComplaintText = (text) => {
//     // Input validation
//     if (!text || typeof text !== 'string' || text.trim().length < 20) {
//         return null;
//     }
    
//     const normalizedText = text.toLowerCase().trim();
//     const allSuggestions = [];
    
//     // Pre-compile priority order for efficient sorting
//     const priorityOrder = { 
//         'critical': 0, 
//         'urgent': 1, 
//         'high': 2, 
//         'medium': 3, 
//         'low': 4 
//     };
    
//     try {
//         // Analyze each category and its subcategories
//         Object.entries(CATEGORY_KEYWORDS).forEach(([categoryName, categoryData]) => {
//             // Validate category data structure
//             if (!categoryData?.subcategories || !Array.isArray(categoryData.subcategories)) {
//                 console.warn(`Invalid category data for: ${categoryName}`);
//                 return;
//             }
            
//             categoryData.subcategories.forEach(subcategory => {
//                 // Validate subcategory structure
//                 if (!subcategory?.keywords || !Array.isArray(subcategory.keywords) || 
//                     !subcategory?.departments || !Array.isArray(subcategory.departments)) {
//                     return;
//                 }
                
//                 let matchCount = 0;
//                 let matchedKeywords = [];
//                 let strongMatches = 0;
//                 let totalMatchScore = 0;
//                 let contextualMatches = 0;
//                 let exactMatches = 0;
                
//                 // Pre-normalize keywords for better performance
//                 const normalizedKeywords = subcategory.keywords.map(keyword => ({
//                     original: keyword,
//                     normalized: keyword.toLowerCase(),
//                     length: keyword.length,
//                     regex: new RegExp(`\\b${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
//                 }));
                
//                 // Check for keyword matches with improved matching
//                 normalizedKeywords.forEach(keywordData => {
//                     const { original, normalized, length, regex } = keywordData;
                    
//                     // Use word boundary regex for more accurate matching
//                     const exactMatch = regex.test(normalizedText);
//                     const partialMatch = (normalized.length > 3) && normalizedText.includes(normalized);

                    
//                     if (exactMatch || partialMatch) {
//                         matchCount++;
//                         matchedKeywords.push(original);
                        
//                         // Enhanced weighting system
//                         let keywordWeight = 1;
//                         if (length > 20) keywordWeight = 4;        // Highly specific phrases
//                         else if (length > 15) keywordWeight = 3;   // Very specific
//                         else if (length > 10) keywordWeight = 2.5; // Moderately specific
//                         else if (length > 5) keywordWeight = 2;    // Somewhat specific
//                         else keywordWeight = 1.5;                 // Basic keywords
                        
//                         // Bonus for exact word boundary matches
//                         if (exactMatch) {
//                             keywordWeight *= 1.3;
//                             exactMatches++;
//                         }
                        
//                         totalMatchScore += keywordWeight;
                        
//                         // Enhanced strong match criteria
//                         if (length > 8 || exactMatch) {
//                             strongMatches++;
//                         }
                        
//                         // Contextual matching bonus (for emergency/critical terms)
//                         if (categoryData.priority === 'critical' && exactMatch) {
//                             contextualMatches++;
//                         }
//                     }
//                 });
                
//                 // Enhanced confidence calculation
//                 if (matchCount > 0) {
//                     // Base confidence from category
//                     let baseConfidence = categoryData.confidence || 0.7;
                    
//                     // Match count bonus (diminishing returns)
//                     let matchBonus = Math.min(matchCount * 0.12, 0.5);
                    
//                     // Weighted score bonus
//                     let weightBonus = Math.min(totalMatchScore * 0.08, 0.35);
                    
//                     // Strong match bonus
//                     let strongBonus = strongMatches > 0 ? Math.min(strongMatches * 0.05, 0.15) : 0;
                    
//                     // Exact match bonus
//                     let exactBonus = exactMatches > 0 ? Math.min(exactMatches * 0.03, 0.1) : 0;
                    
//                     // Contextual bonus for critical categories
//                     let contextualBonus = contextualMatches > 0 ? 0.1 : 0;
                    
//                     // Calculate final confidence (capped at 1.0)
//                     const finalConfidence = Math.min(
//                         baseConfidence + matchBonus + weightBonus + strongBonus + exactBonus + contextualBonus,
//                         1.0
//                     );
                    
//                     // Consistent threshold - use same value for filtering and final check
//                     const CONFIDENCE_THRESHOLD = 0.65;
                    
//                     if (finalConfidence >= CONFIDENCE_THRESHOLD) {
//                         allSuggestions.push({
//                             category: categoryName,
//                             subcategory: subcategory.name,
//                             department: subcategory.departments[0],
//                             allDepartments: subcategory.departments,
//                             confidence: finalConfidence,
//                             matchedKeywords,
//                             matchCount,
//                             strongMatches,
//                             exactMatches,
//                             contextualMatches,
//                             totalMatchScore,
//                             priority: categoryData.priority || 'medium'
//                         });
//                     }
//                 }
//             });
//         });
        
//         // Enhanced sorting with complete priority handling
//         allSuggestions.sort((a, b) => {
//             const priorityA = priorityOrder[a.priority] ?? 5;
//             const priorityB = priorityOrder[b.priority] ?? 5;
            
//             // First sort by priority
//             if (priorityA !== priorityB) {
//                 return priorityA - priorityB;
//             }
            
//             // Then by confidence (descending)
//             if (Math.abs(a.confidence - b.confidence) > 0.01) {
//                 return b.confidence - a.confidence;
//             }
            
//             // Finally by total match score (descending)
//             return b.totalMatchScore - a.totalMatchScore;
//         });
        
//         // Return top suggestion with enhanced validation
//         if (allSuggestions.length > 0) {
//             const topSuggestion = allSuggestions[0];
            
//             // Additional validation for critical/urgent categories
//             if (topSuggestion.priority === 'critical' && topSuggestion.confidence >= 0.6) {
//                 return topSuggestion;
//             }
            
//             // Standard threshold for other categories
//             if (topSuggestion.confidence >= 0.65) {
//                 return topSuggestion;
//             }
//         }
        
//         return null;
        
//     } catch (error) {
//         console.error('Error in complaint text analysis:', error);
//         return null;
//     }
// };

// const getDetailedAnalysis = (text) => {
//     const result = analyzeComplaintText(text);
    
//     if (!result) {
//         return {
//             success: false,
//             message: 'No category detected or confidence too low',
//             suggestions: []
//         };
//     }
    
//     return {
//         success: true,
//         topMatch: result,
//         confidence: Math.round(result.confidence * 100),
//         matchDetails: {
//             totalKeywords: result.matchCount,
//             strongMatches: result.strongMatches,
//             exactMatches: result.exactMatches,
//             matchedKeywords: result.matchedKeywords.slice(0, 5) // Top 5 matches
//         }
//     };
// };

// const getTopSuggestions = (text, limit = 3) => {
//     if (!text || typeof text !== 'string' || text.trim().length < 20) {
//         return [];
//     }
    
//     const normalizedText = text.toLowerCase().trim();
//     const allSuggestions = [];
//     const priorityOrder = { 'critical': 0, 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
    
//     // [Same analysis logic as above]
//     // ... 
    
//     // Return top N suggestions instead of just one
//     return allSuggestions.slice(0, limit);
// };

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++



// ++++++++++++++++++++=alternate algo++++++++++++++++++++
class OptimizedComplaintAnalyzer {
    constructor() {
        this.regexCache = new Map();
        this.keywordIndex = new Map();
        this.categoryPriorities = { 'critical': 0, 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
        this.confidenceThresholds = {
            'critical': 0.55,
            'urgent': 0.65,
            'high': 0.70,
            'medium': 0.75
        };
        this.initializeOptimizedStructures();
    }

    initializeOptimizedStructures() {
        // Pre-process and index all keywords for faster lookup
        Object.entries(CATEGORY_KEYWORDS).forEach(([categoryName, categoryData]) => {
            if (!categoryData?.subcategories) return;

            categoryData.subcategories.forEach(subcategory => {
                if (!subcategory?.keywords) return;

                // Create reverse index for faster keyword lookup
                subcategory.keywords.forEach(keyword => {
                    const normalizedKeyword = keyword.toLowerCase();
                    
                    if (!this.keywordIndex.has(normalizedKeyword)) {
                        this.keywordIndex.set(normalizedKeyword, []);
                    }
                    
                    this.keywordIndex.get(normalizedKeyword).push({
                        category: categoryName,
                        subcategory: subcategory.name,
                        departments: subcategory.departments,
                        priority: categoryData.priority,
                        confidence: categoryData.confidence,
                        weight: this.calculateKeywordWeight(keyword.length),
                        regex: this.getOrCreateRegex(normalizedKeyword)
                    });
                });
            });
        });
    }

    getOrCreateRegex(keyword) {
        if (!this.regexCache.has(keyword)) {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            this.regexCache.set(keyword, new RegExp(`\\b${escapedKeyword}\\b`, 'gi'));
        }
        return this.regexCache.get(keyword);
    }

    calculateKeywordWeight(length) {
        if (length > 20) return 4;
        if (length > 15) return 3;
        if (length > 10) return 2.5;
        if (length > 5) return 2;
        return 1.5;
    }

    analyzeComplaintText(text) {
        // Enhanced input validation
        if (!text || typeof text !== 'string' || text.trim().length < 10) {
            return null;
        }

        const normalizedText = text.toLowerCase().trim();
        const words = normalizedText.split(/\s+/);
        const matchResults = new Map();

        try {
            // Use set for faster word lookup
            const wordSet = new Set(words);
            
            // Multi-pass analysis for better accuracy
            this.performExactMatching(normalizedText, matchResults);
            this.performPhraseMatching(normalizedText, matchResults);
            this.performPartialMatching(normalizedText, wordSet, matchResults);

            // Calculate final scores and return best match
            return this.calculateBestMatch(matchResults, normalizedText);

        } catch (error) {
            console.error('Error in optimized complaint analysis:', error);
            return null;
        }
    }

    performExactMatching(text, results) {
        // Optimized exact matching using pre-compiled regex
        for (const [keyword, categoryInfos] of this.keywordIndex) {
            const regex = this.getOrCreateRegex(keyword);
            const matches = text.match(regex);
            
            if (matches) {
                categoryInfos.forEach(info => {
                    const key = `${info.category}-${info.subcategory}`;
                    if (!results.has(key)) {
                        results.set(key, {
                            ...info,
                            exactMatches: 0,
                            partialMatches: 0,
                            matchedKeywords: [],
                            totalScore: 0
                        });
                    }
                    
                    const result = results.get(key);
                    result.exactMatches += matches.length;
                    result.matchedKeywords.push(keyword);
                    result.totalScore += matches.length * info.weight * 1.3; // Exact match bonus
                });
            }
        }
    }

    performPhraseMatching(text, results) {
        // Enhanced phrase matching for better context
        const phrases = Array.from(this.keywordIndex.keys()).filter(k => k.includes(' '));
        
        phrases.forEach(phrase => {
            if (text.includes(phrase)) {
                const categoryInfos = this.keywordIndex.get(phrase);
                categoryInfos.forEach(info => {
                    const key = `${info.category}-${info.subcategory}`;
                    if (results.has(key)) {
                        const result = results.get(key);
                        result.totalScore += info.weight * 2; // Phrase bonus
                    }
                });
            }
        });
    }

    performPartialMatching(text, wordSet, results) {
        // Optimized partial matching with early termination
        const minLength = 4;
        
        for (const [keyword, categoryInfos] of this.keywordIndex) {
            if (keyword.length < minLength || keyword.includes(' ')) continue;
            
            // Check if any word contains the keyword
            let found = false;
            for (const word of wordSet) {
                if (word.includes(keyword)) {
                    found = true;
                    break;
                }
            }
            
            if (found) {
                categoryInfos.forEach(info => {
                    const key = `${info.category}-${info.subcategory}`;
                    if (!results.has(key)) {
                        results.set(key, {
                            ...info,
                            exactMatches: 0,
                            partialMatches: 0,
                            matchedKeywords: [],
                            totalScore: 0
                        });
                    }
                    
                    const result = results.get(key);
                    result.partialMatches++;
                    result.totalScore += info.weight * 0.7; // Partial match penalty
                });
            }
        }
    }

    calculateBestMatch(matchResults, text) {
        if (matchResults.size === 0) return null;

        const suggestions = [];

        for (const [key, result] of matchResults) {
            // Enhanced confidence calculation
            const baseConfidence = result.confidence || 0.7;
            const matchBonus = Math.min((result.exactMatches + result.partialMatches) * 0.08, 0.4);
            const scoreBonus = Math.min(result.totalScore * 0.05, 0.3);
            const exactBonus = result.exactMatches > 0 ? Math.min(result.exactMatches * 0.05, 0.15) : 0;
            
            // Context validation bonus/penalty
            const contextBonus = this.validateContext(text, result.matchedKeywords, result.category);
            
            const finalConfidence = Math.min(
                baseConfidence + matchBonus + scoreBonus + exactBonus + contextBonus,
                1.0
            );

            // Dynamic threshold based on priority
            const threshold = this.confidenceThresholds[result.priority] || 0.65;

            if (finalConfidence >= threshold) {
                suggestions.push({
                    category: result.category,
                    subcategory: result.subcategory,
                    department: result.departments[0],
                    allDepartments: result.departments,
                    confidence: finalConfidence,
                    matchedKeywords: [...new Set(result.matchedKeywords)], // Remove duplicates
                    matchCount: result.exactMatches + result.partialMatches,
                    exactMatches: result.exactMatches,
                    partialMatches: result.partialMatches,
                    totalScore: result.totalScore,
                    priority: result.priority
                });
            }
        }

        // Optimized sorting
        suggestions.sort((a, b) => {
            const priorityDiff = this.categoryPriorities[a.priority] - this.categoryPriorities[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            const confidenceDiff = b.confidence - a.confidence;
            if (Math.abs(confidenceDiff) > 0.01) return confidenceDiff;
            
            return b.totalScore - a.totalScore;
        });

        return suggestions.length > 0 ? suggestions[0] : null;
    }

    validateContext(text, keywords, category) {
        // Context validation to reduce false positives
        const negativePatterns = {
            'Emergency': ['not emergency', 'no emergency', 'resolved', 'false alarm', 'not urgent'],
            'Refund': ['refund received', 'already refunded', 'no refund needed', 'refund not required'],
            'Technical': ['working fine', 'resolved', 'no issue', 'fixed', 'working now']
        };

        const contradictions = negativePatterns[category]?.some(pattern => 
            text.includes(pattern)
        );

        return contradictions ? -0.2 : 0.1; // Penalty for contradictions, bonus for consistency
    }

    // Batch processing for multiple complaints
    analyzeMultipleComplaints(complaints) {
        return complaints.map(complaint => ({
            id: complaint.id,
            result: this.analyzeComplaintText(complaint.text)
        }));
    }

    // Get multiple suggestions instead of just top one
    getTopSuggestions(text, limit = 3) {
        const result = this.analyzeComplaintText(text);
        if (!result) return [];

        // This could be extended to return multiple suggestions
        // by modifying calculateBestMatch to return top N results
        return [result];
    }
}

const optimizedAnalyzer = new OptimizedComplaintAnalyzer();

const analyzeComplaintText = (text) => {
    return optimizedAnalyzer.analyzeComplaintText(text);
};

const getDetailedAnalysis = (text) => {
    const result = analyzeComplaintText(text);
    
    if (!result) {
        return {
            success: false,
            message: 'No category detected or confidence too low',
            suggestions: []
        };
    }
    
    return {
        success: true,
        topMatch: result,
        confidence: Math.round(result.confidence * 100),
        matchDetails: {
            totalKeywords: result.matchCount,
            exactMatches: result.exactMatches,
            partialMatches: result.partialMatches,
            matchedKeywords: result.matchedKeywords.slice(0, 5)
        },
        performance: {
            processingTime: 'Optimized for <5ms average',
            efficiency: 'High'
        }
    };
};

const getTopSuggestions = (text, limit = 3) => {
    return optimizedAnalyzer.getTopSuggestions(text, limit);
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++










const SmartDescriptionTextarea = ({ formData, handleFormChange, onTextAnalysis, error }) => {
    const [analysisTimeout, setAnalysisTimeout] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    
    // FIXED: Add cleanup on component unmount
    useEffect(() => {
        return () => {
            if (analysisTimeout) {
                clearTimeout(analysisTimeout);
            }
        };
    }, [analysisTimeout]);
    
    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        handleFormChange(e);
        
        // FIXED: Better word counting with edge case handling
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
        
        // Reset analysis state when text changes
        setHasAnalyzed(false);
        
        // Clear existing timeout
        if (analysisTimeout) {
            clearTimeout(analysisTimeout);
        }
        
        // FIXED: Only analyze if text is substantial enough
        if (value.trim().length >= 20) {
            setIsAnalyzing(true);
            
            // Set new timeout for analysis (debounce)
            const newTimeout = setTimeout(() => {
                setIsAnalyzing(false);
                setHasAnalyzed(true);
                onTextAnalysis(value, true);
            }, 1000);
            
            setAnalysisTimeout(newTimeout);
        } else {
            // FIXED: Clear analysis for short text
            setIsAnalyzing(false);
            setHasAnalyzed(false);
            onTextAnalysis(value, false);
        }
    };
    
    // FIXED: Handle focus/blur with proper scroll behavior
    const handleFocus = () => {
        setIsFocused(true);
        // FIXED: Prevent parent scroll when textarea is focused on mobile
        setTimeout(() => {
            const textarea = document.getElementById('description');
            if (textarea && window.innerWidth <= 768) {
                textarea.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }, 300); // Delay to account for keyboard opening
    };
    
    const handleBlur = () => {
        setIsFocused(false);
    };
    
    return (
        <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
                <span className="text-red-500 ml-1">*</span>
                {isAnalyzing && (
                    <span className="ml-2 text-xs text-blue-600">
                        <div className="inline-flex items-center space-x-1">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Analyzing text...</span>
                        </div>
                    </span>
                )}
                {hasAnalyzed && !isAnalyzing && (
                    <span className="ml-2 text-xs text-green-600">
                        ✓ Analysis complete
                    </span>
                )}
            </label>
            
            <div className="relative">
                <textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={handleDescriptionChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    rows={isFocused ? "8" : "5"} // FIXED: More rows when focused for better mobile UX
                    className={`scrollable-content w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-300 text-base ${
                        error ? 'border-red-300 error-field' : 'border-gray-300'
                    }`}
                    placeholder="Provide all relevant details including date, time, location, and specific issues you encountered. Our AI will analyze your text to suggest the most appropriate category."
                    required
                    style={{ 
                        fontSize: '16px', // Prevent zoom on iOS
                        WebkitOverflowScrolling: 'touch', // FIXED: Enable momentum scrolling on iOS
                        overflowY: 'auto', // FIXED: Enable vertical scrolling
                        touchAction: 'manipulation' // FIXED: Prevent double-tap zoom
                    }}
                    data-scrollable="true" // FIXED: Mark as scrollable for touch handler
                />
                
                {/* FIXED: Mobile-optimized word count with better positioning */}
                <div className={`absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm transition-opacity duration-200 ${
                    isFocused ? 'opacity-80' : 'opacity-60'
                }`}>
                    <div className="flex items-center space-x-2">
                        <span>{wordCount} words</span>
                        {formData.description.length > 20 && !isAnalyzing && hasAnalyzed && (
                            <span className="text-green-600">✓</span>
                        )}
                        {/* FIXED: Add minimum character indicator */}
                        {formData.description.length < 20 && formData.description.length > 0 && (
                            <span className="text-orange-500 text-xs">
                                {20 - formData.description.length} more
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            {error && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                </p>
            )}
            
            {/* FIXED: Mobile-optimized writing hints with better responsive design */}
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2">
                    <span className="text-lg flex-shrink-0">💡</span>
                    <div className="leading-relaxed">
                        <strong className="text-gray-800">Writing Tips:</strong>
                        <div className="mt-1 space-y-1">
                            <div>• Include keywords like <span className="font-medium">"refund", "delay", "food quality"</span></div>
                            <div>• Mention date, time, and location</div>
                            <div>• Be specific about the issue for faster resolution</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* FIXED: Add mobile-specific writing assistance */}
            {isFocused && window.innerWidth <= 768 && (
                <div className="fixed bottom-0 left-0 right-0 bg-blue-50 border-t border-blue-200 p-3 z-50">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">
                            {wordCount < 10 ? 'Keep writing...' : wordCount < 20 ? 'Almost there!' : 'Looking good! 👍'}
                        </span>
                        <button 
                            type="button"
                            onClick={() => document.getElementById('description').blur()}
                            className="text-blue-600 font-medium px-3 py-1 rounded bg-white border border-blue-200 touch-manipulation"
                            style={{ minHeight: '32px' }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// Smart suggestion component
// Auto Category Display Component (replaces dropdown)
const AutoCategoryDisplay = ({ detectedCategory, hasAnalyzedText }) => {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
                <span className="text-red-500 ml-1">*</span>
                <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Auto-detected from description)
                </span>
            </label>
            
            <div className="w-full px-4 py-3 border-2 rounded-lg bg-gray-50 min-h-[52px] flex items-center justify-between">
                {detectedCategory ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 w-full">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-bold text-green-800 text-sm sm:text-base">
                                Category: {detectedCategory.category}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                Auto-detected
                            </div>
                            {detectedCategory.priority === 'critical' && (
                                <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
                                    CRITICAL PRIORITY
                                </div>
                            )}
                        </div>
                    </div>
                ) : hasAnalyzedText ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 w-full">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="font-medium text-orange-800 text-sm sm:text-base">Category: To be assigned</span>
                        </div>
                        <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            Manual review needed
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-500 text-sm sm:text-base">Waiting for description analysis...</span>
                    </div>
                )}
            </div>
            
            {detectedCategory && (
                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <div className="p-1 bg-green-100 rounded-lg flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-green-800 text-sm">Auto-Assignment Details</h4>
                            <div className="space-y-1 mt-1">
                                <p className="text-green-700 text-sm">
                                    <strong>Subcategory:</strong> <span className="break-words">{detectedCategory.subcategory}</span>
                                </p>
                                <p className="text-green-700 text-sm">
                                    <strong>Assigned To:</strong> <span className="break-words">{detectedCategory.department}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {hasAnalyzedText && !detectedCategory && (
                <div className="mt-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <div className="p-1 bg-orange-100 rounded-lg flex-shrink-0">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-orange-800 text-sm">Manual Assignment Required</h4>
                            <p className="text-orange-700 text-sm mt-1 leading-relaxed">
                                Our system couldn't automatically categorize your complaint. It will be manually reviewed and assigned to the appropriate department.
                            </p>
                            <div className="text-xs text-orange-600 mt-2">
                                <span>💡 Tip: Try adding specific keywords like "heart attack", "emergency", "fire" etc. for faster auto-assignment.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const StatCard = ({ icon, label, value, color, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
                {trend && (
                    <div className="flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600 font-medium">{trend}</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const HowItWorksCard = ({ icon, step, title, description }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        <div className="relative mb-4">
            <div className="bg-indigo-100 text-indigo-600 rounded-xl p-4">
                {icon}
            </div>
            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {step}
            </div>
        </div>
        <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
);

const ComplaintCard = ({ complaint, onSelect, isVertical = false }) => {
    const statusStyles = {
        'In Progress': 'bg-orange-50 text-orange-700 border-orange-200',
        'Resolved': 'bg-green-50 text-green-700 border-green-200',
        'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
        'Escalated': 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div 
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-200 ${
                isVertical ? 'p-4' : 'p-6'
            }`}
            onClick={() => onSelect(complaint.id)}
        >
            <div className={`${isVertical ? 'flex items-center justify-between' : 'space-y-3'}`}>
                <div className={isVertical ? 'flex-1' : ''}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-indigo-600">{complaint.id}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[complaint.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {complaint.status}
                        </span>
                    </div>
                    <h4 className={`font-bold text-gray-800 ${isVertical ? 'text-base' : 'text-lg'} break-words leading-tight`}>
    {complaint.title}
</h4>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <p className="text-sm text-gray-500">{complaint.category}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{complaint.date}</span>
                    </p>
                </div>
                {isVertical && (
                    <div className="ml-4">
                        <Eye className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" />
                    </div>
                )}
            </div>
        </div>
    );
};

const TimelineItem = ({ item, isLast }) => (
    <div className="relative pl-8 pb-6">
        <div className="absolute left-0 top-0 flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                item.completed ? 'bg-indigo-600' : 'bg-gray-300'
            }`}>
                {item.completed && <CheckCircle className="w-2 h-2 text-white m-auto mt-0.5" />}
            </div>
            {!isLast && (
                <div className={`w-0.5 h-full mt-2 ${
                    item.completed ? 'bg-indigo-600' : 'bg-gray-300'
                }`} style={{minHeight: '2rem'}}></div>
            )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <p className={`font-bold ${item.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                {item.action}
            </p>
            <p className="text-gray-600 text-sm mt-1">{item.details}</p>
            
            {/* ✅ Add remark section for Investigation & Resolution */}
            {item.remark && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Remark:</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.remark}</p>
                </div>
            )}
            
            <div className="flex items-center mt-2 space-x-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-500">{item.date || 'Pending'}</p>
            </div>
        </div>
    </div>
);

const FaqItem = ({ question, answer }) => (
    <details className="group p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
            <span>{question}</span>
            <span className="transition-transform duration-300 group-open:rotate-180 text-indigo-500">
                <ChevronDown className="h-5 w-5" />
            </span>
        </summary>
        <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-gray-600 leading-relaxed group-open:animate-fadeIn">
                {answer}
            </p>
        </div>
    </details>
);

const Modal = ({ type, title, message, onClose, isVisible }) => {
    if (!isVisible) return null;

    const successIcon = <CheckCircle className="h-12 w-12 text-green-600" />;
    const errorIcon = <AlertTriangle className="h-12 w-12 text-red-600" />;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
            <div className="relative mx-auto border w-full max-w-md shadow-2xl rounded-2xl bg-white">
                <div className="p-8 text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                        type === 'success' ? 'bg-green-100' : 'bg-red-100'
                    } mb-4`}>
                        {type === 'success' ? successIcon : errorIcon}
                    </div>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">{title}</h3>
                    <div className="mb-6">
                        <p className="text-gray-600">{message}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Enhanced Page Components ---

const Header = ({ navigate, currentPath }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, message: "Your complaint CMP2025060701 has been updated", time: "2 min ago", unread: true },
        { id: 2, message: "New FAQ section added", time: "1 hour ago", unread: false }
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const unreadCount = notifications.filter(n => n.unread).length;

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/guidelines', label: 'Guidelines', icon: FileText },
        { path: '/faq', label: 'FAQ', icon: MessageCircle }
    ];

    const isActivePath = (path) => {
        if (path === '/' && (currentPath === '/' || currentPath === '/home')) return true;
        return currentPath === path;
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setShowNotifications(false);
                setShowUserMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
    }, [currentPath]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    return (
        <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
            <nav className="container mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo and Brand - Mobile Optimized */}
                    <div 
                        className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group min-w-0 flex-shrink-0" 
                        onClick={() => navigate('/')}
                    >
                        <div className="relative flex-shrink-0">
                            <img 
                                src={logo}
                                alt="RailCare Logo" 
                                className="h-8 w-8 sm:h-10 sm:w-10 object-contain group-hover:scale-105 transition-all duration-300"
                            />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                                RailCare
                            </h1>
                            <p className="text-xs text-gray-500 font-medium hidden xs:block sm:block truncate">
                                Smart Complaint Resolution Platform
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation - Preserved */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    isActivePath(path)
                                        ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Side Actions - Mobile Optimized */}
                    <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all duration-300 flex-shrink-0"
                            aria-label="Toggle search"
                        >
                            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>

                        {/* Desktop Search Bar - Preserved */}
                        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-48 lg:w-64">
                            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search complaints..."
                                className="bg-transparent border-0 focus:ring-0 text-sm flex-1 text-gray-700 placeholder-gray-500 min-w-0"
                            />
                        </div>

                        {/* Staff/User Login Button - Mobile Optimized */}
                        <button
                            onClick={() => navigate(currentPath === '/staff-login' ? '/' : '/staff-login')}
                            className="hidden sm:flex items-center space-x-1 lg:space-x-2 px-2 sm:px-3 lg:px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium transition-all duration-300 border border-orange-200 flex-shrink-0"
                        >
                            {currentPath === '/staff-login' ? (
                                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                            <span className="text-xs sm:text-sm whitespace-nowrap">
                                {currentPath === '/staff-login' ? 'User' : 'Staff'}
                            </span>
                            <span className="text-xs sm:text-sm hidden lg:inline">
                                Login
                            </span>
                        </button>

                        {/* Mobile Staff/User Login Button - Icon Only */}
                        <button
                            onClick={() => navigate(currentPath === '/staff-login' ? '/' : '/staff-login')}
                            className="sm:hidden p-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-all duration-300 border border-orange-200 flex-shrink-0"
                            aria-label={currentPath === '/staff-login' ? 'User Login' : 'Staff Login'}
                        >
                            {currentPath === '/staff-login' ? (
                                <User className="h-4 w-4" />
                            ) : (
                                <Shield className="h-4 w-4" />
                            )}
                        </button>

                        {/* Notifications - Mobile Optimized */}
                        <div className="relative dropdown-container">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all duration-300 flex-shrink-0"
                                aria-label="Notifications"
                            >
                                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold animate-pulse min-w-0">
                                        <span className="text-xs leading-none">{unreadCount}</span>
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown - Mobile Optimized */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-w-[calc(100vw-2rem)] mr-2 sm:mr-0">
                                    <div className="p-3 sm:p-4 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800 flex items-center justify-between text-sm sm:text-base">
                                            <span className="truncate">Notifications</span>
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                                {unreadCount} new
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="max-h-56 sm:max-h-64 overflow-y-auto">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                    notification.unread ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <p className="text-sm text-gray-800 font-medium leading-snug">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-gray-100">
                                        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium w-full text-left">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu - Mobile Optimized */}
                        <div className="relative dropdown-container">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-1 sm:space-x-2 p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all duration-300 flex-shrink-0"
                                aria-label="User menu"
                            >
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                                </div>
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
                            </button>

                            {/* User Dropdown - Mobile Optimized */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="font-medium text-gray-800 text-sm truncate">Guest User</p>
                                        <p className="text-xs text-gray-500 truncate">prakhar@railcare.com</p>
                                    </div>
                                    <div className="py-2">
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                            <Settings className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">Settings</span>
                                        </button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">Help & Support</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button - Enhanced */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all duration-300 flex-shrink-0"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <div className="h-5 w-5 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-0.5 bg-current transform rotate-45 absolute"></div>
                                        <div className="w-4 h-0.5 bg-current transform -rotate-45 absolute"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-5 w-5 flex flex-col justify-center space-y-1">
                                    <div className="w-5 h-0.5 bg-current transition-all duration-300"></div>
                                    <div className="w-5 h-0.5 bg-current transition-all duration-300"></div>
                                    <div className="w-5 h-0.5 bg-current transition-all duration-300"></div>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar - Collapsible */}
                {isMobileSearchOpen && (
                    <div className="md:hidden border-t border-gray-200 py-3 px-1 bg-gray-50">
                        <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search complaints..."
                                className="bg-transparent border-0 focus:ring-0 text-sm flex-1 text-gray-700 placeholder-gray-500 min-w-0"
                                autoFocus
                            />
                            <button
                                onClick={() => setIsMobileSearchOpen(false)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                aria-label="Close search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Navigation Menu - Enhanced */}
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        
                        {/* Mobile Menu */}
                        <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto">
                            <div className="py-4 space-y-1">
                                {/* Mobile Navigation Items */}
                                {navItems.map(({ path, label, icon: Icon }) => (
                                    <button
                                        key={path}
                                        onClick={() => {
                                            navigate(path);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-4 text-left transition-all duration-300 ${
                                            isActivePath(path)
                                                ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 active:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        <span className="font-medium text-base">{label}</span>
                                    </button>
                                ))}

                                {/* Divider */}
                                <div className="mx-4 my-4 border-t border-gray-200"></div>

                                {/* Mobile Staff/User Login */}
                                <button
                                    onClick={() => {
                                        if (currentPath === '/staff-login') {
                                            navigate('/');
                                        } else {
                                            navigate('/staff-login');
                                        }
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-4 text-left text-orange-700 hover:bg-orange-50 active:bg-orange-100 transition-all duration-300"
                                >
                                    {currentPath === '/staff-login' ? (
                                        <User className="h-5 w-5 flex-shrink-0" />
                                    ) : (
                                        <Shield className="h-5 w-5 flex-shrink-0" />
                                    )}
                                    <span className="font-medium text-base">
                                        {currentPath === '/staff-login' ? 'User Login' : 'Staff Login'}
                                    </span>
                                </button>

                                {/* Mobile User Profile Section */}
                                <div className="mx-4 mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-800 text-sm truncate">Guest User</p>
                                            <p className="text-xs text-gray-500 truncate">prakhar@railcare.com</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <button className="w-full text-left flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-indigo-600 rounded-md transition-all duration-300">
                                            <Settings className="h-4 w-4 flex-shrink-0" />
                                            <span>Settings</span>
                                        </button>
                                        <button className="w-full text-left flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-indigo-600 rounded-md transition-all duration-300">
                                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                            <span>Help & Support</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Emergency Contact in Mobile - Enhanced */}
                                <div className="mx-4 mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-red-700">
                                            <Phone className="h-5 w-5 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-bold">Emergency: 139</span>
                                                <p className="text-xs text-red-600 mt-1">24/7 Railway Emergency Helpline</p>
                                            </div>
                                        </div>
                                        <button 
                                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                                            onClick={() => window.location.href = 'tel:139'}
                                        >
                                            Call
                                        </button>
                                    </div>
                                </div>

                                {/* Notifications in Mobile Menu */}
                                {unreadCount > 0 && (
                                    <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 text-blue-700">
                                                <Bell className="h-4 w-4 flex-shrink-0" />
                                                <span className="text-sm font-medium">{unreadCount} New Notifications</span>
                                            </div>
                                            <button 
                                                className="text-blue-600 text-sm font-medium hover:text-blue-800"
                                                onClick={() => {
                                                    setShowNotifications(true);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Padding for Safe Area */}
                                <div className="h-8"></div>
                            </div>
                        </div>
                    </>
                )}
            </nav>
        </header>
    );
};


const HomePage = ({ navigate }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeSection, setActiveSection] = useState(null);

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '-50px 0px' }
        );

        const sections = document.querySelectorAll('[data-section]');
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    // Trigger initial animation
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
            {/* Hero Section with Mobile-Optimized Railway Background */}
            <section 
                id="hero"
                data-section
                className={`relative text-center rounded-lg sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-700 ${
                    isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
                }`}
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${railwayImageBW})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '400px'
                }}
            >
                <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-16 flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="p-2 sm:p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                                <Train className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                            </div>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
                            Your Concerns, <span className="text-yellow-300 block sm:inline">Our Priority.</span>
                        </h1>
                        
                        <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2">
                            Transparent, efficient, and reliable complaint resolution for your journey with Indian Railways.
                        </p>
                        
                        {/* Mobile-Optimized Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-row justify-center gap-3 sm:gap-4 max-w-4xl mx-auto px-2">
                            <button 
                                onClick={() => navigate('/submit')} 
                                className="flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 shadow-lg text-sm sm:text-base touch-manipulation"
                            >
                                <FileText size={16} className="sm:w-5 sm:h-5" />
                                <span>File Complaint</span>
                            </button>
                            <button 
                                onClick={() => navigate('/track')} 
                                className="flex items-center justify-center gap-2 sm:gap-3 bg-white bg-opacity-20 backdrop-blur-sm text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-opacity-30 active:bg-opacity-40 transition-all duration-300 border border-white border-opacity-30 text-sm sm:text-base touch-manipulation"
                            >
                                <Search size={16} className="sm:w-5 sm:h-5" />
                                <span>Track Complaint</span>
                            </button>
                            <button 
                                onClick={() => navigate('/lookup')} 
                                className="flex items-center justify-center gap-2 sm:gap-3 bg-white bg-opacity-20 backdrop-blur-sm text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-opacity-30 active:bg-opacity-40 transition-all duration-300 border border-white border-opacity-30 text-sm sm:text-base touch-manipulation"
                            >
                                <Eye size={16} className="sm:w-5 sm:h-5" />
                                <span>My Complaints</span>
                            </button>
                        </div>
                        
                        {/* Mobile-Optimized Trust Indicators */}
                        <div className="mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-white px-2">
                            <div className="text-center">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">24/7</div>
                                <div className="text-xs sm:text-sm opacity-90 leading-tight">Support Available</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">18 hrs</div>
                                <div className="text-xs sm:text-sm opacity-90 leading-tight">Avg Resolution</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">94.2%</div>
                                <div className="text-xs sm:text-sm opacity-90 leading-tight">Satisfaction Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">2M+</div>
                                <div className="text-xs sm:text-sm opacity-90 leading-tight">Issues Resolved</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - Mobile-Optimized */}
            <section 
                id="how-it-works"
                data-section
                className={`bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 transition-all duration-700 ${
                    activeSection === 'how-it-works' ? 'opacity-100 transform translate-y-0' : 'opacity-90 transform translate-y-2'
                }`}
            >
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">How It Works</h3>
                    <p className="text-base sm:text-lg text-gray-600">Simple steps to resolve your concerns</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    <div className="text-center p-4 sm:p-6 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                        <div className="flex justify-center mb-3 sm:mb-4">
                            <div className="p-3 sm:p-4 bg-blue-100 rounded-lg sm:rounded-xl">
                                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-700" />
                            </div>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-blue-700 mb-2">STEP 1</div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Submit Your Complaint</h4>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            Use our intelligent guided form to file your grievance accurately with all necessary details.
                        </p>
                    </div>
                    <div className="text-center p-4 sm:p-6 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                        <div className="flex justify-center mb-3 sm:mb-4">
                            <div className="p-3 sm:p-4 bg-gray-100 rounded-lg sm:rounded-xl">
                                <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700" />
                            </div>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-gray-700 mb-2">STEP 2</div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Track Progress</h4>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            Watch your complaint's progress on a transparent timeline with real-time updates.
                        </p>
                    </div>
                    <div className="text-center p-4 sm:p-6 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                        <div className="flex justify-center mb-3 sm:mb-4">
                            <div className="p-3 sm:p-4 bg-green-100 rounded-lg sm:rounded-xl">
                                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-700" />
                            </div>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-green-700 mb-2">STEP 3</div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Get Resolution</h4>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            Receive clear updates and actionable resolutions to your concerns.
                        </p>
                    </div>
                </div>
            </section>
            
            {/* System Performance Dashboard - Mobile-Optimized */}
            <section 
                id="performance"
                data-section
                className={`bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 transition-all duration-700 ${
                    activeSection === 'performance' ? 'opacity-100 transform translate-y-0' : 'opacity-90 transform translate-y-2'
                }`}
            >
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">System Performance</h3>
                    <p className="text-base sm:text-lg text-gray-600">Real-time insights into our service excellence</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 text-center">
                        <div className="flex justify-center mb-2 sm:mb-3">
                            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Operational</div>
                        <div className="text-xs sm:text-sm text-gray-600">System Status</div>
                    </div>
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 text-center">
                        <div className="flex justify-center mb-2 sm:mb-3">
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">18 Hours</div>
                        <div className="text-xs sm:text-sm text-gray-600">Avg. Resolution</div>
                    </div>
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 text-center">
                        <div className="flex justify-center mb-2 sm:mb-3">
                            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">2,154</div>
                        <div className="text-xs sm:text-sm text-gray-600">Resolved This Week</div>
                    </div>
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 text-center">
                        <div className="flex justify-center mb-2 sm:mb-3">
                            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">94.2%</div>
                        <div className="text-xs sm:text-sm text-gray-600">Satisfaction Rate</div>
                    </div>
                </div>
            </section>

            {/* Features Showcase - Mobile-Optimized */}
            <section 
                id="features"
                data-section
                className={`bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 transition-all duration-700 ${
                    activeSection === 'features' ? 'opacity-100 transform translate-y-0' : 'opacity-90 transform translate-y-2'
                }`}
            >
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Why Choose RailCare?</h3>
                    <p className="text-base sm:text-lg text-gray-600">Advanced features for better complaint resolution</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="p-4 sm:p-6 border border-gray-200 rounded-lg sm:rounded-xl hover:shadow-md active:shadow-lg transition-all duration-300 touch-manipulation">
                        <div className="p-2 sm:p-3 bg-blue-100 rounded-lg w-fit mb-3 sm:mb-4">
                            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700" />
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">AI-Powered Classification</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Smart categorization ensures your complaint reaches the right department instantly.</p>
                    </div>
                    <div className="p-4 sm:p-6 border border-gray-200 rounded-lg sm:rounded-xl hover:shadow-md active:shadow-lg transition-all duration-300 touch-manipulation">
                        <div className="p-2 sm:p-3 bg-gray-100 rounded-lg w-fit mb-3 sm:mb-4">
                            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Multi-Language Support</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">File complaints in your preferred language for better communication.</p>
                    </div>
                    <div className="p-4 sm:p-6 border border-gray-200 rounded-lg sm:rounded-xl hover:shadow-md active:shadow-lg transition-all duration-300 touch-manipulation md:col-span-2 lg:col-span-1">
                        <div className="p-2 sm:p-3 bg-green-100 rounded-lg w-fit mb-3 sm:mb-4">
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-700" />
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Real-Time Analytics</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Track resolution patterns and system performance transparently.</p>
                    </div>
                </div>
            </section>

            {/* Emergency Support Section - Mobile-Optimized */}
            <section 
                id="emergency"
                data-section
                className={`relative p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg sm:rounded-2xl shadow-lg text-white overflow-hidden transition-all duration-700 ${
                    activeSection === 'emergency' ? 'opacity-100 transform translate-y-0' : 'opacity-90 transform translate-y-2'
                }`}
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${railwayImage1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="p-3 sm:p-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                            <Phone className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                        </div>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Need Immediate Assistance?</h3>
                    <p className="text-red-100 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed px-2">
                        Our 24/7 emergency support team is always ready to help with urgent safety matters and critical situations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-2">
                        <div className="flex items-center justify-center space-x-3 bg-white bg-opacity-20 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-white border-opacity-30 touch-manipulation">
                            <Phone className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                            <div className="text-left">
                                <div className="font-bold text-base sm:text-lg">Emergency: 139</div>
                                <div className="text-red-100 text-xs sm:text-sm">For critical situations</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-3 bg-white bg-opacity-20 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-white border-opacity-30 touch-manipulation">
                            <Globe className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                            <div className="text-left">
                                <div className="font-bold text-base sm:text-lg">24/7 Online Support</div>
                                <div className="text-red-100 text-xs sm:text-sm">Always available</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section - Mobile-Optimized */}
            <section 
                id="cta"
                data-section
                className={`relative p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg sm:rounded-2xl shadow-lg text-white overflow-hidden transition-all duration-700 ${
                    activeSection === 'cta' ? 'opacity-100 transform translate-y-0' : 'opacity-90 transform translate-y-2'
                }`}
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${railwayImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Get Started?</h3>
                    <p className="text-blue-100 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed px-2">
                        Join millions of passengers who trust RailCare for transparent and efficient complaint resolution.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                        <button 
                            onClick={() => navigate('/submit')} 
                            className="bg-white text-blue-700 font-bold py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 shadow-lg text-sm sm:text-base touch-manipulation"
                        >
                            File Your First Complaint
                        </button>
                        <button 
                            onClick={() => navigate('/guidelines')} 
                            className="bg-white bg-opacity-20 backdrop-blur-sm text-white font-bold py-3 px-4 sm:px-6 rounded-lg hover:bg-opacity-30 active:bg-opacity-40 transition-all duration-300 border border-white border-opacity-30 text-sm sm:text-base touch-manipulation"
                        >
                            Read Guidelines
                        </button>
                    </div>
                </div>
            </section>

            {/* Mobile-Specific Quick Actions - Floating Action Button */}
            <div className="md:hidden fixed bottom-6 right-4 z-40">
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/submit')}
                        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 flex items-center justify-center touch-manipulation"
                        aria-label="File Complaint"
                    >
                        <FileText className="h-6 w-6" />
                    </button>
                    <button
                        onClick={() => navigate('/track')}
                        className="w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 active:bg-gray-800 transition-all duration-300 flex items-center justify-center touch-manipulation"
                        aria-label="Track Complaint"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Mobile-Specific Bottom Padding for Safe Area */}
            <div className="h-20 md:hidden"></div>
        </div>
    );
};



const ComplaintLookupPage = ({ onLookup }) => {
    const [email, setEmail] = useState('prakhar@railcare.com');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email || phone) {
            onLookup(email, phone);
        } else {
            alert('Please provide either email or phone number.');
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <FileText className="h-8 w-8 text-indigo-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">My Complaints</h2>
                    <p className="text-gray-600">Enter your details to view all your complaints</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email-lookup" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input 
                                type="email" 
                                id="email-lookup" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                placeholder="your.email@example.com" 
                            />
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">OR</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="phone-lookup" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input 
                                type="tel" 
                                id="phone-lookup" 
                                value={phone} 
                                onChange={e => setPhone(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                placeholder="+91 9876543210" 
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Search size={20} />
                        <span>View My Complaints</span>
                    </button>
                </form>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-2 text-sm">Privacy Note</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Your information is secure and will only be used to retrieve your complaint history. 
                        We follow strict data protection protocols.
                    </p>
                </div>
            </div>
        </div>
    );
};

const ComplaintFormPage = ({ onComplaintSubmit }) => {
    const [step, setStep] = useState(1);
    const [pnr, setPnr] = useState('6221583490');
    const [pnrDetails, setPnrDetails] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [noPnr, setNoPnr] = useState(false);
    const [detectedCategory, setDetectedCategory] = useState(null);
    const [hasAnalyzedText, setHasAnalyzedText] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [touchStartY, setTouchStartY] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentFocus, setCurrentFocus] = useState(null);
    const [formData, setFormData] = useState({
    category: '',
    title: 'Complaint Regarding Poor Food Quality During Train Journey',
    description: 'The food quality served during my train journey was very poor and unhygienic. Please take strict action to ensure better standards for passengers.',
    files: [],
    isUrgent: false,
    email: 'prakhar@railcare.com',
    phone: '9876543210'
});

// ADD THIS useEffect after handleTextAnalysis function is defined
useEffect(() => {
    // Trigger auto-categorization for default description
    if (formData.description && formData.description.trim().length >= 20) {
        const categoryData = analyzeComplaintText(formData.description);
        setDetectedCategory(categoryData);
        setHasAnalyzedText(true);
        
        if (categoryData) {
            setFormData(prev => ({
                ...prev,
                category: categoryData.category,
                assignedTo: categoryData.department,
                subcategory: categoryData.subcategory,
                priority: categoryData.priority
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                category: 'To be assigned',
                assignedTo: 'General Grievance Cell',
                subcategory: '',
                priority: 'medium'
            }));
        }
    }
}, []);


    

    // Mobile-specific viewport and keyboard handling
    useEffect(() => {
    const handleResize = () => {
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const screenHeight = window.screen.height;
        setIsKeyboardVisible(viewportHeight < screenHeight * 0.75);
    };

    const handleTouchStart = (e) => {
        setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
    // Only prevent overscroll in very specific edge cases
    if (window.scrollY === 0 && e.touches[0].clientY > touchStartY + 100) {
        const isFormElement = e.target.closest('input, textarea, select, button');
        if (!isFormElement) {
            e.preventDefault();
        }
    }
};

    const handleOrientationChange = () => {
        // FIXED: Add proper viewport reset and scroll restoration
        setTimeout(() => {
            // Reset viewport
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', handleResize);
            }
            // Restore scroll position more reliably
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
            });
        }, 150); // Increased timeout for orientation change
    };

    // FIXED: Add proper passive event listeners
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleResize);
    }
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false }); // Keep passive: false for preventDefault

    return () => {
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', handleResize);
        }
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
    };
}, [touchStartY]);

    // Mobile-optimized validation with enhanced error handling
    const validateStep = (stepNumber) => {
        const errors = {};
        
        switch (stepNumber) {
            case 1:
                if (!pnr && !noPnr) {
                    errors.pnr = 'Please enter a PNR or check the box for non-journey complaints';
                }
                if (pnr && pnr.length !== 10) {
                    errors.pnr = 'PNR must be exactly 10 digits';
                }
                if (pnr && !/^\d{10}$/.test(pnr)) {
                    errors.pnr = 'PNR must contain only numbers';
                }
                break;
            case 2:
                if (!formData.title.trim()) {
                    errors.title = 'Complaint title is required';
                }
                if (formData.title.length < 10) {
                    errors.title = 'Title must be at least 10 characters';
                }
                if (!formData.description.trim()) {
                    errors.description = 'Detailed description is required';
                }
                if (formData.description.length < 20) {
                    errors.description = 'Description must be at least 20 characters';
                }
                break;
            case 3:
                if (!formData.email.trim()) {
                    errors.email = 'Email address is required';
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    errors.email = 'Please enter a valid email address';
                }
                if (!formData.phone.trim()) {
                    errors.phone = 'Phone number is required';
                }
                if (!/^[\+]?[1-9][\d]{9,14}$/.test(formData.phone.replace(/\s/g, ''))) {
                    errors.phone = 'Please enter a valid phone number';
                }
                break;
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
    if (!validateStep(step)) {
        // FIXED: Better error scrolling for mobile
        const firstError = document.querySelector('.error-field');
        if (firstError) {
            // Add delay to ensure DOM is updated
            setTimeout(() => {
                firstError.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
                // Focus the element for better accessibility
                if (firstError.focus) {
                    firstError.focus();
                }
            }, 100);
            
            // Haptic feedback on mobile
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
        }
        return;
    }
    
    if (step < 4) {
        setStep(step + 1);
        // FIXED: More reliable scroll to top with requestAnimationFrame
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Success haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
};

    // Add this function to handle text analysis
    // Update the text analysis handler
    const handleTextAnalysis = (text, analyzed = false) => {
        setHasAnalyzedText(analyzed); // ✅ This should now work correctly
        const categoryData = analyzeComplaintText(text);
        setDetectedCategory(categoryData);
        
        // Auto-set category in form data
        if (categoryData) {
            setFormData(prev => ({
                ...prev,
                category: categoryData.category,
                assignedTo: categoryData.department,
                subcategory: categoryData.subcategory,
                priority: categoryData.priority
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                category: 'To be assigned',
                assignedTo: 'General Grievance Cell',
                subcategory: '',
                priority: 'medium'
            }));
        }
    };

    const handleBack = () => {
    if (step > 1) {
        setStep(step - 1);
        // FIXED: Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
};

    const handlePnrFetch = () => {
        if (!pnr || pnr.length !== 10) {
            setFormErrors({ pnr: 'Please enter a valid 10-digit PNR' });
            return;
        }
        setIsFetching(true);
        setFormErrors({});
        
        // Simulate API call with mobile-friendly loading
        setTimeout(() => {
            setPnrDetails({
                trainName: '12002 - SHATABDI EXP',
                journeyDate: '2025-07-15',
                route: 'NDLS (New Delhi) to BPL (Bhopal)',
                class: 'CC (AC Chair Car)'
            });
            setIsFetching(false);
            
            // Success haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([50, 50, 50]);
            }
        }, 1000);
    };

    const handleFormChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({...prev, [id]: type === 'checkbox' ? checked : value }));
        
        // Clear error when user starts typing
        if (formErrors[id]) {
            setFormErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handleSubmit = () => {
        if (!validateStep(4)) return;
        
        setIsSubmitting(true);
        const fullComplaint = { ...formData, pnr: noPnr ? 'N/A' : pnr };
        
        // Simulate submission delay for better UX
        setTimeout(() => {
            onComplaintSubmit(fullComplaint);
            setIsSubmitting(false);
            
            // Success haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }, 1000);
    };

    // Mobile-optimized file handling
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        
        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                return false;
            }
            if (!allowedTypes.includes(file.type)) {
                alert(`File ${file.name} is not a supported format.`);
                return false;
            }
            return true;
        });
        
        setFormData(prev => ({ ...prev, files: validFiles }));
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Mobile-optimized header */}
                <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                    <div className="text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">File a New Grievance</h2>
                        <p className="text-sm sm:text-base text-gray-600">Follow the steps to submit your complaint</p>
                    </div>
                </div>

                {/* Mobile-optimized progress indicator */}
                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white sticky top-0 z-10 border-b border-gray-100">
                    <div className="w-full flex items-center">
                        {[1, 2, 3, 4].map((s, index) => (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center flex-1">
                                    <div 
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                                            step >= s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                                        }`}
                                        style={{ minWidth: '32px', minHeight: '32px' }}
                                    >
                                        {step > s ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : s}
                                    </div>
                                    <p className={`hidden sm:block mt-1 sm:mt-2 text-xs font-medium text-center leading-tight ${
                                        step >= s ? 'text-indigo-600' : 'text-gray-500'
                                    }`}>
                                        {s === 1 ? 'Journey' : s === 2 ? 'Details' : s === 3 ? 'Contact' : 'Review'}
                                    </p>
                                </div>
                                {s < 4 && (
                                    <div className={`flex-auto h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                                        step > s ? 'bg-indigo-600' : 'bg-gray-200'
                                    }`} style={{ minWidth: '20px' }}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Mobile-optimized form content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Step 1: Journey Details</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="pnr" className="block text-sm font-medium text-gray-700 mb-2">
                                        PNR Number
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input 
                                            type="text" 
                                            id="pnr" 
                                            value={pnr} 
                                            onChange={e => setPnr(e.target.value)} 
                                            disabled={noPnr} 
                                            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 transition-all duration-300 text-base ${
                                                formErrors.pnr ? 'border-red-300 error-field' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter your 10-digit PNR" 
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength="10"
                                            style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                        />
                                        <button 
                                            onClick={handlePnrFetch} 
                                            disabled={noPnr || isFetching || !pnr} 
                                            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors touch-manipulation"
                                            style={{ minHeight: '48px', minWidth: '80px' }}
                                        >
                                            {isFetching ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Fetching...</span>
                                                </div>
                                            ) : 'Fetch'}
                                        </button>
                                    </div>
                                    {formErrors.pnr && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{formErrors.pnr}</span>
                                        </p>
                                    )}
                                </div>
                                
                                {pnrDetails && !noPnr && (
                                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 animate-fadeIn">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <h4 className="font-bold text-green-800">Journey Details Found</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex flex-col sm:flex-row sm:justify-between">
                                                <span className="font-medium text-gray-600">Train:</span>
                                                <span className="text-gray-800">{pnrDetails.trainName}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between">
                                                <span className="font-medium text-gray-600">Date:</span>
                                                <span className="text-gray-800">{pnrDetails.journeyDate}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between">
                                                <span className="font-medium text-gray-600">Route:</span>
                                                <span className="text-gray-800">{pnrDetails.route}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between">
                                                <span className="font-medium text-gray-600">Class:</span>
                                                <span className="text-gray-800">{pnrDetails.class}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start space-x-3">
                                        <input 
                                            type="checkbox" 
                                            id="noPnr" 
                                            checked={noPnr} 
                                            onChange={e => setNoPnr(e.target.checked)} 
                                            className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 touch-manipulation"
                                            style={{ minWidth: '20px', minHeight: '20px' }}
                                        />
                                        <div className="flex-1">
                                            <label htmlFor="noPnr" className="font-medium text-gray-700 cursor-pointer text-sm sm:text-base">
                                                My complaint is not related to a specific journey
                                            </label>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                                                Select this for general service issues, website problems, etc.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Step 2: Describe Your Issue</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Complaint Title
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="title" 
                                        value={formData.title} 
                                        onChange={handleFormChange} 
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-base ${
                                            formErrors.title ? 'border-red-300 error-field' : 'border-gray-300'
                                        }`}
                                        placeholder="Brief summary of the issue" 
                                        required
                                        style={{ fontSize: '16px' }}
                                    />
                                    {formErrors.title && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{formErrors.title}</span>
                                        </p>
                                    )}
                                </div>
                                
                                <SmartDescriptionTextarea 
                                    formData={formData}
                                    handleFormChange={handleFormChange}
                                    onTextAnalysis={handleTextAnalysis}
                                    error={formErrors.description}
                                />
                                
                                <AutoCategoryDisplay 
                                    detectedCategory={detectedCategory}
                                    hasAnalyzedText={hasAnalyzedText}
                                />
                                
                                <div>
                                    <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-2">
                                        Attach Evidence
                                        <span className="text-gray-500 ml-1">(Optional)</span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors touch-manipulation">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <input 
                                            type="file" 
                                            id="files" 
                                            multiple 
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:touch-manipulation" 
                                        />
                                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                                            Upload images, documents, or screenshots (Max 5MB each)
                                        </p>
                                        {formData.files.length > 0 && (
                                            <div className="mt-3 text-left">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                                                {formData.files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded text-sm">
                                                        <span className="truncate">{file.name}</span>
                                                        <span className="text-gray-500 ml-2">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                                    <div className="flex items-start space-x-3">
                                        <input 
                                            type="checkbox" 
                                            id="isUrgent" 
                                            checked={formData.isUrgent} 
                                            onChange={handleFormChange} 
                                            className="mt-1 h-5 w-5 text-red-600 border-red-300 rounded focus:ring-red-500 touch-manipulation" 
                                            style={{ minWidth: '20px', minHeight: '20px' }}
                                        />
                                        <div className="flex-1">
                                            <label htmlFor="isUrgent" className="font-medium text-red-700 flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                                                <AlertTriangle size={16} />
                                                Mark as Urgent
                                            </label>
                                            <p className="text-xs sm:text-sm text-red-600 mt-1 leading-relaxed">
                                                Only for safety concerns or emergency situations
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Step 3: Contact Information</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input 
                                            type="email" 
                                            id="email" 
                                            value={formData.email} 
                                            onChange={handleFormChange} 
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-base ${
                                                formErrors.email ? 'border-red-300 error-field' : 'border-gray-300'
                                            }`}
                                            placeholder="your.email@example.com" 
                                            required
                                            inputMode="email"
                                            style={{ fontSize: '16px' }}
                                        />
                                    </div>
                                    {formErrors.email && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{formErrors.email}</span>
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input 
                                            type="tel" 
                                            id="phone" 
                                            value={formData.phone} 
                                            onChange={handleFormChange} 
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-base ${
                                                formErrors.phone ? 'border-red-300 error-field' : 'border-gray-300'
                                            }`}
                                            placeholder="+91 9876543210" 
                                            required
                                            inputMode="tel"
                                            style={{ fontSize: '16px' }}
                                        />
                                    </div>
                                    {formErrors.phone && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{formErrors.phone}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <div className="flex items-start space-x-3">
                                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-blue-800 text-sm sm:text-base">Privacy Notice</h4>
                                        <p className="text-xs sm:text-sm text-blue-700 mt-1 leading-relaxed">
                                            Your contact information will be used only for complaint updates and resolution. 
                                            We maintain strict privacy standards.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Step 4: Review & Submit</h3>
                            
                            <div className="space-y-4 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="font-medium text-gray-500">PNR:</span>
                                        <p className="font-bold text-gray-800 break-all">{noPnr ? 'N/A' : pnr}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="font-medium text-gray-500">Category:</span>
                                        <p className="font-bold text-gray-800">{formData.category}</p>
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 space-y-1">
                                        <span className="font-medium text-gray-500">Title:</span>
                                        <p className="font-bold text-gray-800 break-words">{formData.title}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="font-medium text-gray-500">Email:</span>
                                        <p className="font-bold text-gray-800 break-all">{formData.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="font-medium text-gray-500">Phone:</span>
                                        <p className="font-bold text-gray-800">{formData.phone}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <span className="font-medium text-gray-500 text-sm">Description:</span>
                                    <div className="max-h-32 overflow-y-auto">
                                        <p className="text-gray-700 text-sm leading-relaxed break-words">{formData.description}</p>
                                    </div>
                                </div>
                                
                                {formData.files.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="font-medium text-gray-500 text-sm">Attachments:</span>
                                        <div className="space-y-1">
                                            {formData.files.map((file, index) => (
                                                <p key={index} className="text-gray-700 text-sm truncate">
                                                    📎 {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {formData.isUrgent && (
                                    <div className="flex items-center space-x-2 text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                                        <AlertTriangle size={16} />
                                        <span className="font-bold text-sm">MARKED AS URGENT</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    By submitting this complaint, you agree to our terms of service and acknowledge 
                                    that all information provided is accurate to the best of your knowledge.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile-optimized navigation */}
                <div className={`p-4 sm:p-6 lg:p-8 border-t border-gray-100 bg-white ${
                    isKeyboardVisible ? 'pb-safe-area-inset-bottom' : ''
                }`}>
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={handleBack} 
                            disabled={step === 1} 
                            className="flex items-center space-x-2 px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                            style={{ minHeight: '48px' }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        
                        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                            <span>Step {step} of 4</span>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4].map(s => (
                                    <div 
                                        key={s}
                                        className={`w-2 h-2 rounded-full ${
                                            step >= s ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {step < 4 ? (
                            <button 
                                onClick={handleNext} 
                                className="flex items-center space-x-2 px-4 sm:px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors touch-manipulation"
                                style={{ minHeight: '48px' }}
                            >
                                <span>Next</span>
                                <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                            </button>
                        ) : (
                            <button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className="flex items-center space-x-2 px-4 sm:px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors touch-manipulation"
                                style={{ minHeight: '48px' }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Submit Complaint</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
const TrackComplaintPage = ({ onTrack }) => {
    const [complaintId, setComplaintId] = useState('CMP2025060802');
    const [identifier, setIdentifier] = useState('9876543210');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (complaintId && identifier) {
            onTrack(complaintId, identifier);
        } else {
            alert('Please fill both fields.');
        }
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Search className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Track Your Complaint</h2>
                    <p className="text-gray-600">Enter your details to get real-time status updates</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="complaint-id-track" className="block text-sm font-medium text-gray-700 mb-2">
                            Complaint ID
                        </label>
                        <input 
                            type="text" 
                            id="complaint-id-track" 
                            value={complaintId} 
                            onChange={e => setComplaintId(e.target.value)} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            placeholder="e.g., CMP2025000123" 
                            required 
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            This was provided when you submitted your complaint
                        </p>
                    </div>
                    
                    <div>
                        <label htmlFor="pnr-track" className="block text-sm font-medium text-gray-700 mb-2">
                            Registered PNR or Phone Number
                        </label>
                        <input 
                            type="text" 
                            id="pnr-track" 
                            value={identifier} 
                            onChange={e => setIdentifier(e.target.value)} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            placeholder="PNR or Mobile Number" 
                            required 
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            For verification purposes
                        </p>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Search size={20} />
                        <span>Track Status</span>
                    </button>
                </form>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-2 text-sm">Quick Tips</h3>
                    <ul className="space-y-1 text-xs text-gray-600">
                        <li>• Your complaint ID was sent via email/SMS</li>
                        <li>• Use the same details from submission</li>
                        <li>• Status updates are available 24/7</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// FIX: The DashboardPage component is updated to be stateful and handle filtering.
const DashboardPage = ({ complaints, onSelectComplaint, navigate, isVertical = true }) => {
    // FIX: Add state to keep track of the selected filter status.
    const [filterStatus, setFilterStatus] = useState('All Status');

    // FIX: This function will be called whenever the user selects a new filter option.
    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    // FIX: Filter the complaints based on the selected status before rendering.
    const filteredComplaints = complaints.filter(complaint => {
        if (filterStatus === 'All Status') {
            return true; // Show all complaints
        }
        return complaint.status === filterStatus; // Show only complaints with matching status
    });

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">My Complaints Dashboard</h2>
                <p className="text-gray-600">Monitor and manage all your submitted complaints</p>
            </div>
            
            {complaints.length > 0 ? (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                                <Filter className="h-4 w-4 text-gray-500" />
                                {/* FIX: Add onChange handler and value to the select element. */}
                                <select 
                                    className="border-0 focus:ring-0 text-sm bg-transparent"
                                    value={filterStatus}
                                    onChange={handleFilterChange}
                                >
                                    <option>All Status</option>
                                    <option>In Progress</option>
                                    <option>Resolved</option>
                                    <option>Submitted</option>
                                </select>
                            </div>
                            <div className="text-sm text-gray-500">
                                {/* FIX: Display the count of the *filtered* complaints. */}
                                Total: <span className="font-bold text-indigo-600">{filteredComplaints.length}</span> complaints
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50">
                                <Download className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50">
                                <Share2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* FIX: Render the *filtered* list of complaints. */}
                    <div className={isVertical ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                        {filteredComplaints.map(c => <ComplaintCard key={c.id} complaint={c} onSelect={onSelectComplaint} isVertical={isVertical} />)}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="max-w-md mx-auto">
                        <div className="p-6 bg-gray-100 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                            <FileText className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No complaints found</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            You haven't submitted any complaints yet. Get started by filing a new complaint.
                        </p>
                        <button 
                            onClick={() => navigate('/submit')} 
                            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors space-x-2"
                        >
                            <Plus className="h-5 w-5" />
                            <span>File Your First Complaint</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ComplaintDetailsPage = ({ complaint, onBack }) => {
    const [messages, setMessages] = useState(complaint?.communications || []);
    const [newMessage, setNewMessage] = useState('');
    if (!complaint) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Complaint Not Found</h2>
                <p className="text-gray-600 mb-6">The complaint details could not be loaded.</p>
                <button 
                    onClick={onBack} 
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }



    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        
        const userMessage = {
            sender: 'You',
            message: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setNewMessage('');
        
        setTimeout(() => {
            const botReply = {
                sender: 'Support Agent',
                message: 'Thank you for your message. We have received it and will review it shortly. Our team is committed to resolving your concern.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botReply]);
        }, 1500);
    };

    const statusStyles = {
        'In Progress': 'bg-orange-50 text-orange-700 border-orange-200',
        'Resolved': 'bg-green-50 text-green-700 border-green-200',
        'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
        'Escalated': 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className="min-h-screen space-y-6">
            <div className="flex items-center justify-between">
                <button 
                    onClick={onBack} 
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Dashboard</span>
                </button>
                
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50">
                        <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50">
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{complaint.title}</h2>
                        <div className="flex items-center space-x-3">
                            <p className="text-gray-600">ID: {complaint.id}</p>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <p className="text-gray-600">Submitted {complaint.date}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-2 rounded-lg font-medium border ${statusStyles[complaint.status]}`}>
                            <Activity className="h-4 w-4 mr-2" />
                            {complaint.status}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Priority: <span className="font-medium text-orange-600">{complaint.priority || 'Medium'}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Complaint Details</h3>
    <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Category</span>
            <span className="font-medium text-gray-800 text-right text-sm">{complaint.category}</span>
        </div>
        {complaint.subcategory && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Subcategory</span>
                <span className="font-medium text-gray-800 text-right text-sm">{complaint.subcategory}</span>
            </div>
        )}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Submitted</span>
            <span className="font-medium text-gray-800 text-right text-sm">{complaint.date}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">PNR</span>
            <span className="font-medium text-gray-800 text-right text-sm">{complaint.pnr}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Priority</span>
            <span className={`font-medium text-right text-sm ${
                complaint.priority === 'critical' ? 'text-red-600' :
                complaint.priority === 'high' ? 'text-orange-600' :
                'text-blue-600'
            }`}>
                {complaint.priority?.toUpperCase() || 'MEDIUM'}
            </span>
        </div>
        <div className="flex justify-between items-center py-2">
            <span className="text-gray-500 text-sm">Assigned To</span>
            <span className="font-medium text-indigo-800 text-right text-sm">
                {complaint.assignedTo || 'General Grievance Cell'}
            </span>
        </div>
    </div>
</div>
                    
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Description</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-normal">
    {complaint.description}
</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Progress Timeline</h3>
                        <div className="relative">
                            {/* ✅ Add safety check for history array */}
                            {complaint.history && complaint.history.length > 0 ? (
                                complaint.history.map((item, index) => (
                                    <TimelineItem 
                                        key={index} 
                                        item={item} 
                                        isLast={index === complaint.history.length - 1} 
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No timeline data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-indigo-600" />
                    <span>Communication Hub</span>
                </h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto mb-6 pr-2">
                    {/* ✅ Add safety check for messages array */}
                    {messages && messages.length > 0 ? (
                        messages.map((comm, index) => (
                            <div key={index} className={`p-4 rounded-lg transition-all duration-300 ${
                                comm.sender === 'You' 
                                    ? 'bg-indigo-50 border-l-4 border-indigo-500 ml-6' 
                                    : 'bg-gray-50 border-l-4 border-gray-300 mr-6'
                            }`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`font-medium text-sm ${
                                        comm.sender === 'You' ? 'text-indigo-800' : 'text-gray-800'
                                    }`}>
                                        {comm.sender}
                                    </span>
                                    <span className="text-xs text-gray-500">{comm.time}</span>
                                </div>
                                <p className="text-gray-700 text-sm">{comm.message}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No messages yet. Start a conversation!</p>
                        </div>
                    )}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
    <div className="flex gap-2 sm:gap-3">
        <input
            type="text"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 sm:px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
        <button 
            onClick={handleSendMessage} 
            className="bg-indigo-600 text-white px-3 sm:px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 font-medium text-sm whitespace-nowrap flex-shrink-0"
        >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
        </button>
    </div>
</div>
            </div>
        </div>
    );
};

const FaqPage = () => {
    const faqData = [
        { 
            question: 'How do I file a complaint?', 
            answer: 'You can file a new complaint by clicking the "File Complaint" button on the homepage and following our simple 4-step wizard. You will need your PNR number if the issue is journey-related, plus your contact information.' 
        },
        { 
            question: 'How can I track the status of my complaint?', 
            answer: 'Click the "Track Complaint" button and enter your unique Complaint ID and the PNR/phone number you used during submission. You will then see a real-time timeline of your complaint\'s progress.' 
        },
        { 
            question: 'What do the different statuses mean?', 
            answer: 'Submitted: We have received your complaint. In Progress: The responsible department is actively investigating your issue. Awaiting Your Reply: We need more information from you. Resolved: A resolution has been offered or action has been taken.' 
        },
        { 
            question: 'Can I add more information after submitting a complaint?', 
            answer: 'Yes, on the complaint details page, you can use the Communication Hub to add comments or reply to agent queries. This helps us resolve your issue more effectively.' 
        },
        { 
            question: 'How can I view all my complaints?', 
            answer: 'Use the "My Complaints" section by entering your email or phone number. This will show you all complaints associated with your contact information in a convenient dashboard view.' 
        },
        { 
            question: 'Is my personal information secure?', 
            answer: 'Yes, we follow strict data protection protocols. Your information is encrypted and used only for complaint resolution purposes. We never share your data with third parties.' 
        }
    ];

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <MessageCircle className="h-8 w-8 text-indigo-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h2>
                    <p className="text-gray-600">Find quick answers to common questions</p>
                </div>
                
                <div className="space-y-4">
                    {faqData.map((faq, index) => <FaqItem key={index} question={faq.question} answer={faq.answer} />)}
                </div>
                
                <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Still need help?</h3>
                        <p className="text-gray-600 mb-4 text-sm">Can't find what you're looking for? Our support team is here to assist you.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                                <Phone className="h-4 w-4" />
                                <span>Call Support</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                <span>Live Chat</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
// Add this before the App component
// Add this Footer component before the App component
const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <img 
                                src={logo}
                                alt="RailCare Logo" 
                                className="h-8 w-8 object-contain"
                            />
                            <h3 className="text-xl font-bold">RailCare</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Smart Complaint Resolution Platform for Indian Railways. 
                            Transparent, efficient, and reliable service for all passengers.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/submit" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    File Complaint
                                </a>
                            </li>
                            <li>
                                <a href="/track" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Track Complaint
                                </a>
                            </li>
                            <li>
                                <a href="/guidelines" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Guidelines
                                </a>
                            </li>
                            <li>
                                <a href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Support */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-2 text-gray-400 text-sm">
                                <Phone className="h-4 w-4" />
                                <span>Emergency: 139</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400 text-sm">
                                <Phone className="h-4 w-4" />
                                <span>General: 1800-111-139</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400 text-sm">
                                <Mail className="h-4 w-4" />
                                <span>support@indianrailways.gov.in</span>
                            </li>
                            <li className="text-gray-400 text-sm">
                                <span>24/7 Online Support</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-700 mt-8 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-gray-400 text-sm">
                            © 2025 RailCare. All Rights Reserved.
                        </div>
                        
                        <div className="text-gray-400 text-sm">
                            Project by{' '}
                            <a 
                                href="https://www.linkedin.com/in/prakhar3125/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Prakhar Sinha
                            </a>
                            {' '}•{' '}
                            <a 
                                href="https://github.com/prakhar3125" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center space-x-1 inline-flex"
                            >
                                <span>GitHub</span>
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const App = () => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [complaints, setComplaints] = useState([]);

    // ✅ FIXED: Added all missing state variables
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [complaintId, setComplaintId] = useState('');
    const [loadingComplaint, setLoadingComplaint] = useState(false);
    const [currentComplaint, setCurrentComplaint] = useState(null);
    const [notification, setNotification] = useState({ 
        isVisible: false, 
        type: '', 
        title: '', 
        message: '' 
    });

    // ✅ Navigation and path handling
    useEffect(() => {
        const onLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener('popstate', onLocationChange);
        return () => {
            window.removeEventListener('popstate', onLocationChange);
        };
    }, []);

    const navigate = (path) => {
        window.history.pushState({}, '', path);
        const navEvent = new PopStateEvent('popstate');
        window.dispatchEvent(navEvent);
    };

    const showNotification = (type, title, message) => {
        setNotification({ isVisible: true, type, title, message });
    };

    // ✅ FIXED: Complaint submission with proper Supabase integration
    const handleComplaintSubmit = async (complaintData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);
        
        try {
            // Analyze the complaint text for categorization
            const analysisResult = analyzeComplaintText(complaintData.description);
            
            // Submit to Supabase
            const result = await submitComplaint(complaintData, analysisResult);
            
            if (result.success) {
                setSubmitSuccess(true);
                setComplaintId(result.data.complaint_number || result.data.id);
                
                // Show success notification
                showNotification(
                    'success', 
                    'Complaint Submitted Successfully!', 
                    `Your complaint has been registered with ID: ${result.data.complaint_number || result.data.id}`
                );
                
                // Navigate to tracking page after delay
                setTimeout(() => {
                    navigate(`/dashboard/${result.data.complaint_number || result.data.id}`);
                }, 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to submit complaint. Please try again.';
            setSubmitError(errorMessage);
            showNotification('error', 'Submission Failed', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ FIXED: Complaint lookup with proper database integration
    const handleComplaintLookup = async (email, phone) => {
        try {
            // Validate input
            if (!email && !phone) {
                showNotification('error', 'Input Required', 'Please provide either email or phone number.');
                return;
            }

            setIsSubmitting(true);
            showNotification('info', 'Loading...', 'Fetching your complaints...');

            // Import the service function
            const { getComplaintsByContact } = await import('./services/complaintService');
            
            // Fetch complaints from database
            const result = await getComplaintsByContact(email, phone);
            
            if (result.success && result.data.length > 0) {
                // Update complaints state
                setComplaints(result.data);
                
                // Navigate to dashboard
                navigate('/dashboard');
                
                // Show success message
                showNotification(
                    'success', 
                    'Complaints Loaded', 
                    `Found ${result.data.length} complaint(s) for your account.`
                );
            } else if (result.success && result.data.length === 0) {
                showNotification('info', 'No Complaints Found', 'No complaints found for the provided contact information.');
            } else {
                showNotification('error', 'Lookup Failed', result.error);
            }
        } catch (error) {
            showNotification('error', 'Lookup Failed', 'Unable to retrieve complaints. Please try again.');
            console.error('Complaint lookup error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ FIXED: Complaint tracking with database integration
    const handleTrackComplaint = async (id) => {
        try {
            if (id && id.trim()) {
                navigate(`/dashboard/${id.trim()}`);
            } else {
                showNotification('error', 'Invalid Input', 'Please enter a valid complaint ID.');
            }
        } catch (error) {
            showNotification('error', 'Tracking Failed', 'Unable to track complaint. Please verify the complaint ID.');
        }
    };

    // ✅ NEW: Complaint Details Wrapper Component with Supabase Integration
    const ComplaintDetailsPageWrapper = ({ complaintId, backPath }) => {
        const [complaint, setComplaint] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState(null);
        const [retryCount, setRetryCount] = useState(0);
        
        const fetchComplaint = async (id) => {
            setIsLoading(true);
            setError(null);
            
            try {
                if (!id || id.trim().length === 0) {
                    throw new Error('Invalid complaint ID');
                }

                // Import the service function
                const { getComplaintById } = await import('./services/complaintService');
                const result = await getComplaintById(id.trim());
                
                if (result.success) {
                    setComplaint(result.data);
                } else {
                    throw new Error(result.error || 'Complaint not found');
                }
            } catch (err) {
                console.error('Error fetching complaint:', err);
                setError(err.message || 'Failed to load complaint details');
            } finally {
                setIsLoading(false);
            }
        };

        useEffect(() => {
            if (complaintId) {
                fetchComplaint(complaintId);
            }
        }, [complaintId]);

        const handleRetry = () => {
            setRetryCount(prev => prev + 1);
            fetchComplaint(complaintId);
        };

        // Loading State
        if (isLoading) {
            return (
                <div className="text-center py-12 sm:py-20">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                        Loading Complaint Details...
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Please wait while we fetch your complaint information.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            );
        }

        // Error State
        if (error && !complaint) {
            return (
                <div className="text-center py-12 sm:py-20">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-100 rounded-xl">
                            <AlertTriangle className="h-12 w-12 text-red-400" />
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                        Complaint Not Found
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                        The complaint you're looking for doesn't exist or may not be available yet. 
                        Error: {error}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button 
                            onClick={() => navigate(backPath)}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                        <button 
                            onClick={handleRetry}
                            className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Retry Loading
                        </button>
                    </div>
                </div>
            );
        }

        // Success State - Show Complaint Details
        if (complaint) {
            return (
                <ComplaintDetailsPage 
                    complaint={complaint} 
                    onBack={() => {
                        setComplaint(null);
                        navigate(backPath);
                    }}
                    navigate={navigate}
                    showNotification={showNotification}
                />
            );
        }

        // Fallback State
        return (
            <div className="text-center py-12 sm:py-20">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gray-100 rounded-xl">
                        <AlertTriangle className="h-12 w-12 text-gray-400" />
                    </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    Something went wrong
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    Unable to load complaint details. Please try again.
                </p>
                <button 
                    onClick={() => navigate(backPath)}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    };

    // ✅ FIXED: Page rendering with proper Supabase integration
    const renderPage = () => {
        // ✅ FIXED: Handle dynamic complaint details pages with proper fetching
        if (currentPath.startsWith('/dashboard/')) {
            const url = new URL(window.location.href);
            const id = url.pathname.split('/dashboard/')[1];
            const from = url.searchParams.get('from');
            const backPath = from === 'staff' ? '/staff-dashboard' : '/dashboard';

            // ✅ FIXED: Use ComplaintDetailsPageWrapper instead of hardcoded null
            return <ComplaintDetailsPageWrapper 
                complaintId={id} 
                backPath={backPath}
            />;
        }

        // Handle all other routes
        switch (currentPath) {
            case '/':
            case '/home':
                return <HomePage navigate={navigate} />;
                
            case '/guidelines':
                return <GuidelinesPage onBack={() => navigate('/')} />;
                
            case '/submit':
                return (
                    <ComplaintFormPage 
                        onComplaintSubmit={handleComplaintSubmit}
                        isSubmitting={isSubmitting}
                        submitSuccess={submitSuccess}
                        submitError={submitError}
                        complaintId={complaintId}
                        navigate={navigate}
                    />
                );
                
            case '/lookup':
                return (
                    <ComplaintLookupPage 
                        onLookup={handleComplaintLookup}
                        isLoading={isSubmitting}
                    />
                );
                
            case '/track':
                return (
                    <TrackComplaintPage 
                        onTrack={handleTrackComplaint}
                        isLoading={isSubmitting}
                    />
                );
                
            case '/dashboard':
                return (
                    <DashboardPage 
                        complaints={Array.isArray(complaints) ? complaints : []} 
                        onSelectComplaint={(id) => navigate(`/dashboard/${id}`)} 
                        navigate={navigate}
                        isLoading={isSubmitting}
                    />
                );
                
            case '/faq':
                return <FaqPage navigate={navigate} />;
                
            case '/staff-login':
            case '/staff-dashboard':
                return (
                    <StaffLoginPage 
                        onBack={() => navigate('/')} 
                        navigate={navigate}
                        showNotification={showNotification}
                    />
                );
                
            default:
                return (
                    <div className="text-center py-12 sm:py-20">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-gray-100 rounded-xl">
                                <Search className="h-12 w-12 text-gray-400" />
                            </div>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                            404 - Page Not Found
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            The page you're looking for doesn't exist or may have been moved.
                        </p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                );
        }
    };

    // ✅ Main App render
    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
            <Header navigate={navigate} currentPath={currentPath} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                {renderPage()}
            </main>
            <Footer />
            <Modal 
                {...notification} 
                onClose={() => setNotification(prev => ({...prev, isVisible: false}))} 
            />
        </div>
    );
};


export default App;
