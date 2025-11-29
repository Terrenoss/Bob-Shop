import React, { useState, useEffect, useRef } from 'react';
import { Review } from '../types';
import { reviewsService } from '../lib/mockNestService';
import { Star, MessageSquare, Image as ImageIcon, Plus, Upload, X, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'react-hot-toast';
import { useApp } from '../app/providers';

interface ReviewSectionProps {
    productId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
    const { user } = useApp();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showAdminForm, setShowAdminForm] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [variant, setVariant] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // For Admin
    const [images, setImages] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        const data = await reviewsService.findByProductId(productId);
        setReviews(data);
        setLoading(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (confirm('Are you sure you want to delete this review?')) {
            await reviewsService.delete(reviewId);
            toast.success('Review deleted');
            loadReviews();
        }
    };

    const handleSubmit = async (e: React.FormEvent, isAdminMode = false) => {
        e.preventDefault();
        if (!comment.trim() || !name.trim()) return;

        setSubmitting(true);
        await reviewsService.create({
            productId,
            userName: name,
            rating,
            comment,
            variant: variant.trim() || undefined,
            date: isAdminMode ? new Date(date).toISOString() : undefined,
            images: images
        });
        
        // Reset and reload
        setSubmitting(false);
        setComment('');
        setName('');
        setVariant('');
        setRating(5);
        setImages([]);
        setShowForm(false);
        setShowAdminForm(false);
        toast.success(isAdminMode ? 'Manual review added' : 'Review submitted successfully!');
        await loadReviews();
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Customer Reviews
                        <span className="text-sm font-normal text-gray-400 bg-zinc-800 px-2 py-1 rounded-full border border-zinc-700">
                            {reviews.length}
                        </span>
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-yellow-400">
                             {[1,2,3,4,5].map(star => (
                                 <Star 
                                    key={star} 
                                    size={20} 
                                    fill={star <= Number(averageRating) ? "currentColor" : "none"} 
                                    className={star <= Number(averageRating) ? "text-yellow-400" : "text-zinc-700"}
                                 />
                             ))}
                        </div>
                        <span className="font-bold text-gray-200">{averageRating} out of 5</span>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {!showForm && !showAdminForm && (
                        <Button onClick={() => setShowForm(true)}>Write a Review</Button>
                    )}
                    {user?.role === 'admin' && !showAdminForm && !showForm && (
                        <Button variant="secondary" onClick={() => setShowAdminForm(true)}>
                            <Plus size={16} className="mr-2"/> Admin Add
                        </Button>
                    )}
                </div>
            </div>

            {/* Standard User Review Form */}
            {showForm && (
                <form onSubmit={(e) => handleSubmit(e, false)} className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 mb-8 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-white mb-4">Write your review</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star 
                                        size={28} 
                                        fill={star <= rating ? "#FACC15" : "none"} 
                                        className={star <= rating ? "text-yellow-400" : "text-zinc-700"}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                            <input 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-zinc-900 text-white placeholder-zinc-600"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Variant Purchased</label>
                            <input 
                                value={variant}
                                onChange={(e) => setVariant(e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-zinc-900 text-white placeholder-zinc-600"
                                placeholder="e.g. Size: M, Color: Blue"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Review</label>
                        <textarea 
                            required
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-zinc-900 text-white placeholder-zinc-600"
                            placeholder="What did you like or dislike?"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" isLoading={submitting}>Submit Review</Button>
                    </div>
                </form>
            )}

            {/* Admin Manual Review Form */}
            {showAdminForm && (
                <form onSubmit={(e) => handleSubmit(e, true)} className="bg-zinc-950 p-6 rounded-xl border border-purple-900/50 mb-8 animate-in fade-in slide-in-from-top-2 relative">
                    <div className="absolute top-0 right-0 p-2 bg-purple-900/20 text-purple-400 text-xs font-bold rounded-bl-xl border-l border-b border-purple-900/50">ADMIN MODE</div>
                    <h3 className="font-bold text-white mb-4">Manual Review Entry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Fake Name</label>
                            <input 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-800 rounded-lg outline-none bg-zinc-900 text-white"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                            <input 
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-800 rounded-lg outline-none bg-zinc-900 text-white"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Variant Info (e.g. Sunset Red)</label>
                            <input 
                                value={variant}
                                onChange={(e) => setVariant(e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-800 rounded-lg outline-none bg-zinc-900 text-white"
                                placeholder="Color: Red, Size: L"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                            <input 
                                type="number"
                                min="1" max="5"
                                required
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-zinc-800 rounded-lg outline-none bg-zinc-900 text-white"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Review Content</label>
                        <textarea 
                            required
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-800 rounded-lg outline-none bg-zinc-900 text-white"
                            placeholder="Content..."
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Photos</label>
                        <div 
                            className="border-2 border-dashed border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-zinc-800/50 transition-all mb-2"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="text-gray-500 mb-1" size={20} />
                            <span className="text-xs text-gray-400">Click to upload photo</span>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                        {images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {images.map((img, i) => (
                                    <div key={i} className="w-16 h-16 rounded bg-zinc-800 border border-zinc-700 overflow-hidden relative group flex-shrink-0">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="secondary" onClick={() => setShowAdminForm(false)}>Cancel</Button>
                        <Button type="submit" isLoading={submitting}>Create Manual Review</Button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-zinc-950/50 rounded-xl border border-dashed border-zinc-800">
                    <MessageSquare className="mx-auto h-10 w-10 text-zinc-700 mb-3" />
                    <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-zinc-800 last:border-0 pb-6 last:pb-0 group/review relative">
                            {/* Delete Button (Visible only to Admin or Author) */}
                            {(user?.role === 'admin' || user?.name === review.userName) && (
                                <button 
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="absolute top-0 right-0 p-2 text-gray-600 hover:text-red-500 hover:bg-zinc-800 rounded-full transition-all opacity-0 group-hover/review:opacity-100"
                                    title="Delete Review"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}

                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 font-bold text-sm border border-zinc-700">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{review.userName}</p>
                                        <div className="flex text-yellow-400 text-xs mt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={12} 
                                                    fill={i < review.rating ? "currentColor" : "none"} 
                                                    className={i < review.rating ? "text-yellow-400" : "text-zinc-700"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-500 pr-8">
                                    {new Date(review.date).toLocaleDateString()}
                                </span>
                            </div>
                            
                            {review.variant && (
                                <div className="text-xs text-gray-400 bg-zinc-950 w-fit px-2 py-0.5 rounded border border-zinc-800 ml-14 mb-2">
                                    {review.variant}
                                </div>
                            )}

                            <p className="text-gray-300 text-sm leading-relaxed pl-14">
                                {review.comment}
                            </p>

                            {review.images && review.images.length > 0 && (
                                <div className="pl-14 mt-3 flex gap-2 overflow-x-auto pb-2">
                                    {review.images.map((img, idx) => (
                                        <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 flex-shrink-0">
                                            <img src={img} alt="User review" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};