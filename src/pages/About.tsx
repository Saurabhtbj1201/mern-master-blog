import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Target, Heart } from 'lucide-react';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - NotePath | Discover Amazing Stories</title>
        <meta name="description" content="Learn about NotePath - a platform for writers and readers to share and discover amazing stories, articles, and ideas." />
        <meta name="keywords" content="NotePath, about, writing platform, blogging, articles, stories" />
        <link rel="canonical" href="https://notepath-np.lovable.app/about" />
        <meta property="og:title" content="About Us - NotePath" />
        <meta property="og:description" content="Learn about NotePath - a platform for writers and readers to share and discover amazing stories." />
        <meta property="og:url" content="https://notepath-np.lovable.app/about" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About Us - NotePath" />
        <meta name="twitter:description" content="Learn about NotePath - a platform for writers and readers to share and discover amazing stories." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">About NotePath</h1>
            <p className="text-xl text-muted-foreground">
              Where ideas find their path to the world
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-muted-foreground text-lg leading-relaxed">
              NotePath is a modern publishing platform designed for writers, thinkers, and storytellers 
              who want to share their ideas with the world. We believe that everyone has a story worth 
              telling, and we're here to help you tell it.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
                    <p className="text-muted-foreground">
                      To empower writers by providing a beautiful, distraction-free platform 
                      where their words can shine and reach readers who care.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Our Community</h3>
                    <p className="text-muted-foreground">
                      We're building a community of passionate writers and curious readers 
                      who value thoughtful, quality content over clickbait.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Our Vision</h3>
                    <p className="text-muted-foreground">
                      To become the go-to platform for independent writers who want to 
                      build an audience and share their expertise with the world.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Our Values</h3>
                    <p className="text-muted-foreground">
                      Quality over quantity, authenticity over perfection, and community 
                      over competition. We celebrate every writer's unique voice.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold mb-4">Join Our Journey</h2>
            <p className="text-muted-foreground mb-6">
              Whether you're a seasoned writer or just starting out, NotePath is here to support 
              your creative journey. Start writing today and let your ideas find their path.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
