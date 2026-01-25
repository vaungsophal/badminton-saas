'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Percent,
    ShieldCheck,
    Bell,
    Globe,
    CreditCard,
    Save
} from 'lucide-react'

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
                <p className="text-gray-600">Configure global platform policies and commission rates</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Commission Settings */}
                <Card className="p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Percent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Commission Rate</h2>
                            <p className="text-sm text-gray-500">Global commission percentage on all bookings</p>
                        </div>
                    </div>

                    <div className="flex items-end gap-6">
                        <div className="flex-1 max-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Fee (%)</label>
                            <div className="relative">
                                <Input type="number" defaultValue="10" className="pr-8 text-lg font-bold" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                            </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 px-8">
                            <Save className="w-4 h-4" />
                            Update Fee
                        </Button>
                    </div>
                    <p className="mt-4 text-xs text-gray-400 italic">Changing this will apply to all future bookings immediately.</p>
                </Card>

                {/* Security & Policies */}
                <Card className="p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-green-600 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Cancellation Policy</h2>
                            <p className="text-sm text-gray-500">Define platform-wide rules for refunds and cancellations</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Refund Threshold (Hours)</label>
                            <Input type="number" defaultValue="24" className="max-w-[120px]" />
                            <p className="mt-1 text-xs text-gray-500">Maximum time before booking starts to allow full refund.</p>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                            <Bell className="w-5 h-5 text-yellow-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800 font-bold">Automatic Review</p>
                                <p className="text-xs text-yellow-700">Flag owners with more than 15% cancellation rate.</p>
                            </div>
                            <div className="w-12 h-6 bg-yellow-400 rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Payment Gateways */}
                <Card className="p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-purple-600 p-2 rounded-lg">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Payment Gateways</h2>
                            <p className="text-sm text-gray-500">Manage payment methods for customers</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-50 p-2 rounded-lg font-bold text-blue-800 italic">Stripe</div>
                                <span className="text-sm font-medium text-gray-900">Connected & Verified</span>
                            </div>
                            <Button variant="ghost" className="text-blue-600 font-bold">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl opacity-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-50 p-2 rounded-lg font-bold text-blue-950 italic">PayPal</div>
                                <span className="text-sm font-medium text-gray-900">Not Configured</span>
                            </div>
                            <Button variant="outline">Connect</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
