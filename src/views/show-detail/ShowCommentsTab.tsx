'use client';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useQueryClient} from '@tanstack/react-query';
import {MessageCircle} from 'lucide-react';
import {Card, Button, LoadingState} from '../../components/common';
import {useComments, useSubmitComment} from '../../api/hooks';

type ShowCommentsTabProps = {
    showId: string;
    openForComments?: boolean;
};

export const ShowCommentsTab = ({showId, openForComments}: ShowCommentsTabProps) => {
    const {t, i18n} = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [comment, setComment] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const {data: comments = [], isLoading, isError} = useComments(showId);
    const submitCommentMutation = useSubmitComment();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!comment.trim()) {
            return;
        }

        try {
            await submitCommentMutation.mutateAsync({
                content: comment,
                show: showId,
            });

            setShowSuccess(true);
            setComment('');
            setTimeout(() => {
                setShowSuccess(false);
            }, 5000);

            // Invalidate comments query to refetch
            queryClient.invalidateQueries({queryKey: ['comments', showId]});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || t('show.comments.errorSubmitting');
            setErrorMessage(message);
        }
    };

    if (isLoading) {
        return <LoadingState fullscreen={false}/>;
    }

    return (
        <div className="space-y-6 w-full md:w-[85%] mx-auto">
            {openForComments && <Card className="bg-primary-50 dark:bg-primary-900">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={t('show.comments.placeholder')}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-800 text-primary-900 dark:text-primary-50 focus:ring-2 focus:ring-secondary-500 dark:focus:ring-secondary-400 resize-none"
                            />
                        </div>
                        <div className="flex items-start w-full md:w-auto">
                            <Button
                                type="submit"
                                variant="secondary"
                                disabled={!comment.trim() || submitCommentMutation.isPending}
                                className="group hover:cursor-pointer w-full md:w-auto justify-center"
                            >
                                {submitCommentMutation.isPending ? t('show.comments.submitting') : t('show.comments.submit')}
                            </Button>
                        </div>
                    </div>


                    {showSuccess &&
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg">
                            <p className="text-green-800 dark:text-green-200">
                                {t('show.comments.success')}
                            </p>
                        </div>}

                    {errorMessage && (
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg">
                            <p className="text-red-800 dark:text-red-200">
                                {errorMessage}
                            </p>
                        </div>
                    )}
                </form>
            </Card>
            }
            {/* Comments List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-accent-600 dark:text-secondary-500 flex items-center gap-2">
                    <MessageCircle size={24}/>
                    {
                        t('show.comments.title')
                    } ({
                    comments.length
                })
                </h3>

                {
                    isError && (
                        <Card>
                            <p className="text-primary-600 dark:text-primary-400">
                                {t('show.comments.errorLoading')}
                            </p>
                        </Card>
                    )
                }

                {
                    !isError && comments.length === 0 && (
                        <Card>
                            <p className="text-primary-600 dark:text-primary-400 text-center py-8">
                                {t('show.comments.noComments')}
                            </p>
                        </Card>
                    )
                }

                {
                    !isError && comments.length > 0 && (
                        <div
                            className="space-y-0 border border-primary-200 dark:border-primary-700 rounded-lg overflow-hidden">
                            {comments.map((commentItem, index) => {
                                const createdAt = commentItem.createdAt ? new Date(commentItem.createdAt) : null;
                                const formattedDate = createdAt
                                    ? createdAt.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '';
                                const formattedTime = createdAt
                                    ? createdAt.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '';

                                return (
                                    <div
                                        key={commentItem.id}
                                        className={`p-4 bg-primary-50 dark:bg-primary-900 ${
                                            index !== comments.length - 1
                                                ? 'border-b border-primary-200 dark:border-primary-700'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <p className="text-primary-900 dark:text-primary-50 leading-relaxed">
                                                    {commentItem.content}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center gap-2 text-sm text-primary-500 dark:text-primary-400">
                                            {commentItem.author && (
                                                <>
                                                    <span>{commentItem.author}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            {formattedDate && (
                                                <>
                                                    <span>{formattedDate}</span>
                                                    {formattedTime && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{formattedTime}</span>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </div>
        </div>
    )
        ;
};
