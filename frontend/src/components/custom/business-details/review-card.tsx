"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Edit, ThumbsUp, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from 'date-fns/locale';
import ReviewerStarRating from "./reviewer-star-rating";

export interface Review {
  review: {
    rating: number;
    review_text: string;
    review_title: string;
    review_id: number;
    user_id: number;
    created_at: string;
    reviewer: {
      username: string;
      email: string;
      role: string;
    };
  };
  reply?: {
    review_reply_id: number;
    reply_text: string;
    created_at: string;
    supervisor: {
      username: string;
      email: string;
      role: string;
    };
  } | null;
  votes_count: number;
  user_has_voted?: boolean;
}

interface ReviewCardProps {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
  currentUserId: number;
  onVote?: (reviewId: number, direction: number) => void;
}

export default function ReviewCardV2(props: ReviewCardProps) {
  const { review: reviewData } = props.review;
  const isOwner = props.currentUserId === reviewData.user_id;
  const hasVoted = props.review.user_has_voted || false;
  const hasReply = props.review.reply !== null;

  return (
    <Card className="max-w-lg w-full h-fit">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {reviewData.reviewer.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{reviewData.reviewer.username}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reviewData.created_at), { locale: fr })}
              </p>
            </div>
          </div>
          <ReviewerStarRating userRating={reviewData.rating} />
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg mb-2">
          {reviewData.review_title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {reviewData.review_text}
        </p>
        
        {/* Display supervisor reply if it exists */}
        {hasReply && props.review.reply && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {props.review.reply.supervisor.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-green-600">Business Supervisor</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(props.review.reply.created_at), { locale: fr })}
                </p>
              </div>
            </div>
            <p className="text-sm">
              {props.review.reply.reply_text}
            </p>
          </div>
        )}
      </CardContent>
      {isOwner && (
        <CardFooter className="pt-0 flex justify-end gap-2 border-t px-6">
          <Button variant="outline" size="sm" onClick={props.onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={props.onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      )}
      <CardFooter className="pt-0 flex justify-between gap-2 border-t px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Cet avis vous a-t-il été utile ?</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={hasVoted ? "default" : "outline"} 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => props.onVote && props.onVote(reviewData.review_id, hasVoted ? 0 : 1)}
            disabled={!props.onVote || props.currentUserId === reviewData.user_id}
            title={props.currentUserId === reviewData.user_id ? "Vous ne pouvez pas voter sur votre propre avis" : hasVoted ? "Supprimer votre vote" : "Voter pour cet avis"}
          >
            <ThumbsUp className={`h-4 w-4 ${hasVoted ? "text-white" : ""}`} />
            <span>{props.review.votes_count}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
