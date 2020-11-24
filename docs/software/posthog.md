---
title: PostHog
date: 2020-11-23 11:00:00 +0000
description: Product analytics

---
## Background

For those not familiar with PostHog, PostHog is an open source product analytics tool. Basically pasting some JavaDcript on your website, and then monitor events on what people are using on your website.

You get to see graphs and charts and ask questions about feature engagement and product usage of your website.

There are existing solutions such as [Mixpanel](https://mixpanel.com/) and [Amplitude](https://amplitude.com/), and of course Google Analytics.

One unique feature about PostHog is the ability to self-host. You easily do this yourself and deploy on Heroku. Alternatively PostHog also offers a free tier on their hosted solution.

If you don't feel comfortable sending data to third party tools, you control the data yourself. In addition, existing product analytics tools can get expensive. After you get off the public pricing, you will likely find yourself paying over $12k/year for one of these tools.

## Glance

A quick product tour...

Once you sign up, you will be given a snippet of javascript code that you will paste in the 'head' section of your webpage.

Paste it and then verify it - Thats it, PostHog has been integrated!.

Then play around on the website you integrated PostHog in. Click a few buttons, navigate a page. Close and open it again.

Then go in to the dashboard. 

![](/uploads/dashboard.png)

You'll see a few tabs on the side.

* Insights
* Events & Actions
* Sessions
* People
* Feature flags

The first four are pretty standard features in a product analytics tools. 

You'll get to ask questions on the how users are interacting with your webpage by filters, like how long users are on a page, the path users take from one particular element to another.

In the events tab you can see one particular person (me) interacting with the website I integrated PostHog with.

![](/uploads/posthog.png) 

The most interesting feature is Feature Flags.

The ability to do A/B testing based on a user segment, and being able to roll back is quite nifty. See this blog post from PostHog themselves for details.

[https://posthog.com/docs/tutorials/feature-flags](https://posthog.com/docs/tutorials/feature-flags "https://posthog.com/docs/tutorials/feature-flags")

## The not so good.

Let's talk about the not so good side of self-hosting. 

Like all self-hosting, you shoulder the burden of operating the tool. While in the beginning, to save costs it might seem like a good idea to just get all the open source products you can get to save money, it will get to the point where time is more valuable, and paying someone some monthly fee is well worth the cost.

Especially once you get to the scale beyond what free providers offer (Heroku) then the cost of infrastructure + the cost of operating this may not be worth the cost of just paying someone to do it.

## Summary

The benefit of a product analytics tool is great for an MVP. 

Build, hack and release a bad product and see how people react. Trust me, it's fun.

Start off with PostHog as an alternative to Google Analytics, thanks to its ease of integration with your website.

Once you get to a scale where operating this can become non-trivial, then consider moving to a hosted solution, either using PostHog's hosted solution or migrating away to another provider.