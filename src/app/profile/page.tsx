"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Trophy, Star, Clock } from "lucide-react";
import {
  getUserStats,
  getUserRecentActivity,
  getOrCreateUserProfile,
  RecentActivityItem,
} from "@/lib/database";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPoints: 0,
    streakDays: 0,
    currentStage: "beginner",
  });
 

  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Ensure user profile exists
      await getOrCreateUserProfile(user.id, user);

      const [userStats, activity] = await Promise.all([
        getUserStats(user.id),
        getUserRecentActivity(user.id, 5),
      ]);

      setStats(userStats);
      setRecentActivity(activity);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-yellow-600";
      case "advanced":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your progress
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={user?.user_metadata?.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {user?.user_metadata?.name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user?.user_metadata?.name || "User"}</CardTitle>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined{" "}
                    {new Date(user?.created_at || "").toLocaleDateString()}
                  </span>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  {stats.currentStage.charAt(0).toUpperCase() +
                    stats.currentStage.slice(1)}{" "}
                  Level
                </Badge>
                <Button variant="outline" className="w-full" onClick={logout}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats and Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {stats.totalProjects}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Projects
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {stats.totalPoints}
                    </div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {
                        recentActivity.filter(
                          (a) => a.type === "project_submission"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Collaborations
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {stats.streakDays}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Streak Days
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={activity.id || index}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {activity.type === "project_submission" && (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {activity.title}
                            </p>
                            <span
                              className={`text-xs font-medium ${getDifficultyColor(
                                activity.difficulty
                              )}`}
                            >
                              {activity.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                            {activity.score && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs font-medium">
                                  {activity.score} pts
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start working on projects to see your activity here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
