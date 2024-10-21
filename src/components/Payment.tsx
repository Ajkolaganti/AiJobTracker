import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const plan = queryParams.get('plan');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        Payment
      </h1>
      <Card className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-center">Payment Details for {plan} Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                required
                className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                required
                className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  required
                  className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  required
                  className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-teal-500 hover:to-green-500">
              Pay Now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}