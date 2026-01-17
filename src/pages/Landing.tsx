import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, TrendingUp, Shield, Users, ArrowRight, CheckCircle } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Voice Your Concerns',
      description: 'Submit complaints and suggestions about academics, infrastructure, hostel, or food.',
    },
    {
      icon: TrendingUp,
      title: 'Prioritize Issues',
      description: 'Upvote posts to help the administration identify the most pressing concerns.',
    },
    {
      icon: Shield,
      title: 'Stay Anonymous',
      description: 'Choose to post anonymously while still having your voice heard.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Engage with fellow students through comments and discussions.',
    },
  ];

  const benefits = [
    'Secure login with Student ID + OTP',
    'Category-based organization',
    'Real-time upvoting system',
    'Admin moderation & response',
    'Anonymous posting option',
    'Trending issues highlighted',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <CheckCircle className="h-4 w-4" />
              For Students, By Students
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Campus,{' '}
              <span className="text-primary">Your Voice</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A safe, organized platform for students to raise complaints and suggestions. 
              Help your college improve by making your voice heard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/login">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/admin-login">Admin Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              CampusVoice provides a structured way for students to communicate with the administration.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Built for Transparency & Trust
              </h2>
              <p className="text-muted-foreground mb-8">
                CampusVoice replaces informal feedback channels with a structured, 
                transparent system that ensures every concern is documented and addressed.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center border border-border">
                <div className="text-center p-8">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    CV
                  </div>
                  <p className="text-lg font-medium">CampusVoice</p>
                  <p className="text-sm text-muted-foreground">Making every voice count</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join your fellow students in creating a better campus experience.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link to="/login">
              Login with Student ID
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              CV
            </div>
            <span className="font-semibold">CampusVoice</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 CampusVoice. For internal college use only.
          </p>
        </div>
      </footer>
    </div>
  );
}
