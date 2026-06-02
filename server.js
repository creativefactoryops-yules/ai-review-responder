const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Free template-based responses — no API key needed
function generateResponse(reviewText, rating, sentiment, tone, businessName, respondAs) {
  const owner = respondAs || 'the owner';
  const biz = businessName || 'our business';
  
  const templates = {
    positive: {
      professional: [
        `Thank you so much for your wonderful review! We're thrilled to hear that you had such a great experience at ${biz}. Your kind words mean a lot to our team, and we look forward to serving you again soon!`,
        `We truly appreciate you taking the time to share your positive experience at ${biz}. Our team works hard to provide the best service possible, and feedback like yours makes it all worth it. See you again soon!`,
      ],
      friendly: [
        `Wow, thank you! 😊 We're so happy you loved your experience at ${biz}. Nothing makes us smile more than knowing our customers are happy. Come back anytime — we'd love to have you again!`,
        `Hey, thanks a million for the kind words! 🙌 We're over the moon that you enjoyed ${biz}. Your support means everything to us. Can't wait to welcome you back!`,
      ],
      thankful: [
        `We are deeply grateful for your wonderful review! 🙏 It's customers like you who make ${biz} such a special place. Thank you for choosing us, and we hope to see you again very soon!`,
        `From the bottom of our hearts, thank you for your glowing review! ❤️ We're so thankful for your support and can't wait to serve you again at ${biz}.`,
      ],
      apologetic: []
    },
    neutral: {
      professional: [
        `Thank you for your feedback about ${biz}. We appreciate you taking the time to share your experience, and we're always looking for ways to improve. We hope to have the opportunity to serve you better in the future.`,
        `Hi there, thank you for your honest review of ${biz}. We value all feedback as it helps us grow. If there's anything specific you'd like to share with our team, please don't hesitate to reach out.`,
      ],
      friendly: [
        `Thanks for stopping by ${biz} and sharing your thoughts! 🎯 We appreciate your feedback and would love to make your next visit even better. Hope to see you again soon!`,
        `Hey, thanks for the feedback! We're always trying to improve at ${biz}, and reviews like yours help us do just that. Come give us another shot sometime — we'd love to impress you!`,
      ],
      thankful: [
        `Thank you for your honest feedback about ${biz}. We appreciate customers like you who help us see where we can do better. We hope you'll give us another chance in the future!`,
        `We're grateful for your feedback! 🙏 At ${biz}, we take every review seriously and use it to improve. Thank you for helping us grow.`,
      ],
      apologetic: []
    },
    negative: {
      professional: [
        `We sincerely apologize for your disappointing experience at ${biz}. This is not the standard we strive for, and we are taking your feedback seriously. Please reach out to us directly so we can make this right.`,
        `Thank you for bringing this to our attention. We apologize that your experience at ${biz} did not meet expectations. Customer satisfaction is our top priority, and we would appreciate the opportunity to address your concerns directly.`,
      ],
      apologetic: [
        `We're truly sorry about your experience at ${biz}. 😔 This is absolutely not okay, and we take full responsibility. Please contact us directly — we want to make this right for you. Your satisfaction matters to us.`,
        `On behalf of everyone at ${biz}, please accept our sincere apologies. We failed to deliver the experience you deserved, and we're committed to doing better. Please give us a chance to make things right — reach out to us directly.`,
      ],
      friendly: [
        `Hey, we're really sorry to hear about your experience at ${biz}. 😕 That's not the visit we wanted you to have. We'd love the chance to make it up to you — please reach out to us directly and we'll take care of you.`,
        `Oh no, we're so sorry! 💔 We dropped the ball at ${biz} and we feel terrible about it. We'd really love to make things right — please give us a chance. Reach out to us and we'll make sure your next experience is much better.`,
      ],
      thankful: []
    }
  };
  
  const toneMap = templates[sentiment] || templates.neutral;
  const options = toneMap[tone] || toneMap.professional || toneMap.friendly || Object.values(toneMap).flat().filter(Boolean);
  
  // If no options for this tone+sentiment combo, fallback
  if (!options || options.length === 0) {
    const allOptions = Object.values(toneMap).flat().filter(Boolean);
    if (allOptions.length > 0) {
      const msg = allOptions[rating % allOptions.length];
      return { response: msg, suggestions: allOptions.filter((_, i) => i !== rating % allOptions.length).slice(0, 2) };
    }
  }
  
  const idx = rating % options.length;
  const response = options[idx] || options[0];
  const suggestions = options.filter((_, i) => i !== idx).slice(0, 2);
  
  return { response, suggestions };
}

app.post('/api/respond', (req, res) => {
  try {
    const { reviewText = '', rating = 3, sentiment = 'neutral', tone = 'professional', businessName = '', respondAs = '' } = req.body;
    if (!reviewText.trim()) return res.status(400).json({ error: 'Review text is required' });
    
    const result = generateResponse(reviewText, parseInt(rating), sentiment, tone, businessName, respondAs);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('✅ Free Review Responder on :' + PORT));
