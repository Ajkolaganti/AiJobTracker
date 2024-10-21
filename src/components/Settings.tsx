// SettingsPage.tsx

import React from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        Settings
      </h1>
      <div className="grid gap-6">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Email Notifications</Label>
              <Switch id="notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <Switch id="darkMode" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 focus:border-blue-500 rounded"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Current Plan: Free</p>
            <Button asChild className="bg-blue-500 hover:bg-blue-600">
              <Link to="/subscriptions">Upgrade Subscription</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}