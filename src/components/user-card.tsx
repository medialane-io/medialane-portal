"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  CheckCircle2,
  MapPin,
  Calendar,
  ExternalLink,
  UserPlus,
  UserMinus,
  Heart,
  MessageCircle,
  Share2,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/components/ui/use-toast"

export type MarketplaceUser = {
  id: string
  name?: string
  username?: string
  avatar?: string
  banner?: string
  bio?: string
  location?: string
  verified?: boolean
  collections?: number
  assets?: number
  listed?: number
  volumeEth?: number
  followers?: number
  following?: boolean
  tags?: string[]
  joinedDate?: string
  role?: string
  isActive?: boolean
  joinedRecently?: boolean
  trending?: boolean
}

export default function UserCard({ user }: { user: MarketplaceUser }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(user.following || false)
  const [isLiked, setIsLiked] = useState(false)

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const name = user?.name || "Unknown"
  const username = user?.username || user?.name?.toLowerCase().replace(/\s+/g, "") || "unknown"
  const avatar = user?.avatar || "/creator-avatar.png"
  const banner = user?.banner || "/creator-banner.png"
  const bio = user?.bio || "No bio provided."
  const isVerified = Boolean(user?.verified)
  const location = user?.location
  const joinedDate = user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : "Unknown"

  const collections = typeof user?.collections === "number" ? user.collections : 0
  const assets = typeof user?.assets === "number" ? user.assets : 0
  const volumeEth = typeof user?.volumeEth === "number" ? user.volumeEth : 0
  const followers = typeof user?.followers === "number" ? user.followers : 0

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFollowing(!isFollowing)
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: `You ${isFollowing ? "unfollowed" : "are now following"} ${name}`,
      duration: 2000,
    })
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${name} ${isLiked ? "removed from" : "added to"} your favorites`,
      duration: 2000,
    })
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: `${name} - MediaLane`,
        text: `Check out ${name}'s profile on MediaLane`,
        url: `${window.location.origin}/users/${user.id}`,
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/users/${user.id}`)
      toast({
        title: "Link copied",
        description: "Profile link copied to clipboard",
        duration: 2000,
      })
    }
  }

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toast({
      title: "Message",
      description: `Opening chat with ${name}...`,
      duration: 2000,
    })
  }

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border bg-background transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
      variants={item}
      whileHover={{ y: -2 }}
      onClick={() => router.push(`/users/${user.id}`)}
    >

      <div className="relative h-32 overflow-hidden">
        <img
          src={banner || "/placeholder.svg"}
          alt={`${name} banner`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-3 right-3 flex gap-2">
          {user.isActive && (
            <Badge className="bg-green-500/90 text-white">
              <Zap className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
          {user.trending && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>

        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white" onClick={handleLike}>
            <Heart className={`h-3 w-3 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="relative -mt-10 px-4 pb-4">

        <div className="relative mb-3">
          <Avatar className="h-16 w-16 border-4 border-background">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={`${name} avatar`} />
            <AvatarFallback>{(name || "NA").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          {user.role && (
            <Badge variant="outline" className="absolute -bottom-1 -right-1 text-xs bg-background">
              {user.role === "creator" ? <Award className="h-3 w-3 mr-1" /> : <UserPlus className="h-3 w-3 mr-1" />}
              {user.role}
            </Badge>
          )}
        </div>

        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <h4 className="font-semibold truncate text-lg">{name}</h4>
            {isVerified && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
          </div>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{bio}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Joined {joinedDate}</span>
          </div>
          {followers > 0 && (
            <div className="flex items-center gap-1">
              <UserPlus className="h-3 w-3" />
              <span>{followers.toLocaleString()} followers</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-md bg-muted/50">
            <div className="text-sm font-semibold">{assets.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Assets</div>
          </div>
          <div className="text-center p-2 rounded-md bg-muted/50">
            <div className="text-sm font-semibold">{collections.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Collections</div>
          </div>
          <div className="text-center p-2 rounded-md bg-muted/50">
            <div className="text-sm font-semibold">{volumeEth.toFixed(1)} Ξ</div>
            <div className="text-xs text-muted-foreground">Volume</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {(user?.tags || []).slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-primary/10"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/users?search=${tag}`)
              }}
            >
              #{tag}
            </Badge>
          ))}
          {(user?.tags || []).length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{(user?.tags || []).length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant={isFollowing ? "outline" : "default"} size="sm" className="flex-1" onClick={handleFollow}>
            {isFollowing ? (
              <>
                <UserMinus className="h-3 w-3 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Follow
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleMessage}>
            <MessageCircle className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              router.push(`/users/${user.id}`)
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
