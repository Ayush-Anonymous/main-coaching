import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Building2, Calendar, CreditCard, User, Lock, Bell, Save } from "lucide-react";

type InstituteSettings = {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
};

type AcademicSettings = {
  current_session: string;
  session_start: string;
  session_end: string;
};

type FeeSettings = {
  late_fee_percentage: number;
  grace_period_days: number;
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [institute, setInstitute] = useState<InstituteSettings>({
    name: "EduElite Institute",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo_url: "",
  });

  const [academic, setAcademic] = useState<AcademicSettings>({
    current_session: "2024-25",
    session_start: "2024-04-01",
    session_end: "2025-03-31",
  });

  const [fees, setFees] = useState<FeeSettings>({
    late_fee_percentage: 5,
    grace_period_days: 7,
  });

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch settings from database
      const { data: settings } = await supabase.from("settings").select("*");

      if (settings) {
        settings.forEach((s) => {
          if (s.key === "institute" && s.value) {
            const val = s.value as unknown as InstituteSettings;
            setInstitute(val);
          } else if (s.key === "academic" && s.value) {
            const val = s.value as unknown as AcademicSettings;
            setAcademic(val);
          } else if (s.key === "fees" && s.value) {
            const val = s.value as unknown as FeeSettings;
            setFees(val);
          }
        });
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          email: profileData.email || user.email || "",
          phone: profileData.phone || "",
        });
      }

      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  const saveSettings = async (key: string, value: InstituteSettings | AcademicSettings | FeeSettings) => {
    setSaving(true);

    const { error } = await supabase
      .from("settings")
      .update({ value: value as unknown as Record<string, never> })
      .eq("key", key);

    if (error) {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }

    setSaving(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
    }

    setSaving(false);
  };

  const changePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (passwordForm.new.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });

    if (error) {
      toast({ title: "Error changing password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password changed successfully" });
      setPasswordForm({ current: "", new: "", confirm: "" });
    }

    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Settings" subtitle="Manage institute configuration and preferences.">
      <Tabs defaultValue="institute" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="institute" className="gap-2">
            <Building2 className="w-4 h-4" />
            Institute
          </TabsTrigger>
          <TabsTrigger value="academic" className="gap-2">
            <Calendar className="w-4 h-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Institute Settings */}
        <TabsContent value="institute">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Institute Information</CardTitle>
              <CardDescription>Basic information about your institute.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inst_name">Institute Name</Label>
                  <Input
                    id="inst_name"
                    value={institute.name}
                    onChange={(e) => setInstitute({ ...institute, name: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inst_email">Email</Label>
                  <Input
                    id="inst_email"
                    type="email"
                    value={institute.email}
                    onChange={(e) => setInstitute({ ...institute, email: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inst_phone">Phone</Label>
                  <Input
                    id="inst_phone"
                    value={institute.phone}
                    onChange={(e) => setInstitute({ ...institute, phone: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inst_website">Website</Label>
                  <Input
                    id="inst_website"
                    value={institute.website}
                    onChange={(e) => setInstitute({ ...institute, website: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inst_address">Address</Label>
                <Textarea
                  id="inst_address"
                  value={institute.address}
                  onChange={(e) => setInstitute({ ...institute, address: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inst_logo">Logo URL</Label>
                <Input
                  id="inst_logo"
                  value={institute.logo_url}
                  onChange={(e) => setInstitute({ ...institute, logo_url: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <Separator className="my-4" />
              <Button onClick={() => saveSettings("institute", institute)} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Settings */}
        <TabsContent value="academic">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Academic Year Settings</CardTitle>
              <CardDescription>Configure the current academic session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session">Current Session</Label>
                  <Input
                    id="session"
                    value={academic.current_session}
                    onChange={(e) => setAcademic({ ...academic, current_session: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_start">Session Start</Label>
                  <Input
                    id="session_start"
                    type="date"
                    value={academic.session_start}
                    onChange={(e) => setAcademic({ ...academic, session_start: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_end">Session End</Label>
                  <Input
                    id="session_end"
                    type="date"
                    value={academic.session_end}
                    onChange={(e) => setAcademic({ ...academic, session_end: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <Button onClick={() => saveSettings("academic", academic)} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Settings */}
        <TabsContent value="fees">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Fee Configuration</CardTitle>
              <CardDescription>Configure late fee and payment settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="late_fee">Late Fee Percentage (%)</Label>
                  <Input
                    id="late_fee"
                    type="number"
                    value={fees.late_fee_percentage}
                    onChange={(e) => setFees({ ...fees, late_fee_percentage: parseFloat(e.target.value) || 0 })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grace_period">Grace Period (Days)</Label>
                  <Input
                    id="grace_period"
                    type="number"
                    value={fees.grace_period_days}
                    onChange={(e) => setFees({ ...fees, grace_period_days: parseInt(e.target.value) || 0 })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <Button onClick={() => saveSettings("fees", fees)} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_email">Email</Label>
                  <Input
                    id="profile_email"
                    value={profile.email}
                    disabled
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_phone">Phone</Label>
                  <Input
                    id="profile_phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-4">
                <Button onClick={changePassword} disabled={saving} className="gap-2">
                  <Lock className="w-4 h-4" />
                  {saving ? "Changing..." : "Change Password"}
                </Button>
                <Button variant="destructive" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
