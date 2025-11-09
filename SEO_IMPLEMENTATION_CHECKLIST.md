# SEO/AEO/GEO Implementation Checklist for TS Finanse

## IMMEDIATE ACTIONS (Do Today)

### 1. Verify Files Are Deployed
After your next build/deployment, verify these URLs are accessible:

```bash
# Test in browser or using curl:
https://www.tsfinanse.com/robots.txt
https://www.tsfinanse.com/sitemap.xml
https://www.tsfinanse.com/llms.txt
```

Expected response: HTTP 200 OK with file content visible

---

### 2. Submit Sitemap to Search Engines

**Google Search Console:**
1. Go to: https://search.google.com/search-console
2. Add property: `www.tsfinanse.com`
3. Verify ownership (DNS or HTML file upload)
4. Go to "Sitemaps" in left menu
5. Submit: `https://www.tsfinanse.com/sitemap.xml`
6. Wait 24-48 hours for initial indexing

**Bing Webmaster Tools:**
1. Go to: https://www.bing.com/webmasters
2. Add site: `www.tsfinanse.com`
3. Verify ownership
4. Submit sitemap: `https://www.tsfinanse.com/sitemap.xml`

---

### 3. Verify robots.txt is Working

**Test in Google Search Console:**
1. Go to "Robots.txt Tester" tool
2. Enter: `https://www.tsfinanse.com/robots.txt`
3. Verify no errors
4. Test specific user-agents (Googlebot, GPTBot, etc.)

**Quick Manual Test:**
```bash
curl https://www.tsfinanse.com/robots.txt
```
Should show your complete robots.txt content with AI crawler permissions.

---

## WEEK 1 ACTIONS

### 4. Monitor Initial Crawling

**Google Search Console:**
- Check "Coverage" report after 3-5 days
- Verify all pages from sitemap are discovered
- Fix any crawl errors that appear

**Expected Results:**
- Homepage: Indexed within 24 hours
- Legal pages: Indexed within 48 hours
- Partner program page: Will show as "Submitted URL not found" (404) until page is created - this is normal

---

### 5. Set Up Monitoring

**Google Analytics 4:**
Create custom segments to track:
- Organic search traffic
- Direct traffic (may include AI referrals)
- Social traffic (from link sharing)

**Search Console:**
- Enable email alerts for critical issues
- Monitor "Performance" report weekly
- Track impressions and clicks for target keywords

---

### 6. Baseline Measurements

Document current status (before AI optimization takes effect):

```
Date: 2025-11-09
Organic Traffic (last 30 days): [INSERT YOUR DATA]
Featured Snippets Owned: [INSERT YOUR DATA]
Average Position for "pożyczka hipoteczna dla firm": [INSERT YOUR DATA]
AI Citations Found (ChatGPT search): [TEST AND INSERT]
```

---

## MONTH 1 ACTIONS

### 7. Create Partner Program Page

**Critical:** Your sitemap includes `/programpartnerski` route.

**When creating this page, ensure:**
- URL matches exactly: `https://www.tsfinanse.com/programpartnerski`
- Content matches information in llms.txt (1% commission, etc.)
- Include contact email: partnerzy@tsfinanse.com
- Add structured data (schema markup) for better indexing

**After page is live:**
- Resubmit sitemap to Google/Bing
- Check Search Console to verify indexing within 48 hours

---

### 8. Test AI Crawler Access

**Verify AI systems can read your content:**

**ChatGPT Test:**
1. Ask ChatGPT: "What is TS Finanse and what services do they offer?"
2. Check if it mentions your site or provides accurate information
3. Note: May take 2-4 weeks for llms.txt to be fully ingested

**Perplexity Test:**
1. Search Perplexity: "business mortgage loans Poland"
2. Check if TS Finanse appears in sources
3. Evaluate accuracy of cited information

**Google SGE Test (if available in Poland):**
1. Search Google: "pożyczka hipoteczna dla firm"
2. Check if AI overview includes your site
3. Note any inaccuracies for llms.txt updates

---

### 9. Monitor AI Crawler Activity

**Check Server Logs:**
Look for these user-agents in your access logs:
- `GPTBot` (OpenAI)
- `anthropic-ai` (Claude)
- `PerplexityBot` (Perplexity)
- `Google-Extended` (Gemini)
- `CCBot` (Common Crawl)

**If you see these crawlers:**
✅ Your robots.txt is working correctly
✅ AI systems are indexing your content

**If you DON'T see these crawlers after 2 weeks:**
- Verify robots.txt is accessible
- Check for server-level blocks (firewall, CDN)
- Ensure llms.txt is properly formatted

---

## ONGOING MAINTENANCE

### Weekly Tasks:

**Monitor Search Console:**
- Check for new crawl errors
- Review performance report (impressions, clicks, CTR)
- Identify new keyword opportunities

**AI Citation Check:**
- Search ChatGPT: "site:tsfinanse.com" (see if your domain appears)
- Ask ChatGPT specific questions about Polish business loans
- Note any inaccuracies for llms.txt updates

---

### Monthly Tasks:

**Update llms.txt (if needed):**
- Product changes (interest rates, loan amounts)
- New services or features
- Contact information updates
- FAQ additions based on common customer questions

**Update sitemap.xml:**
- Change `lastmod` dates for updated pages
- Add new pages as they're created
- Resubmit to Google/Bing after updates

**Performance Review:**
- Compare traffic to previous month
- Track AI-driven conversions (ask leads how they found you)
- Review featured snippet performance
- Analyze zero-click search trends

---

### Quarterly Tasks:

**Comprehensive Audit:**
- Review all three files (robots.txt, sitemap.xml, llms.txt)
- Check for new AI crawlers to add to robots.txt
- Update business information in llms.txt
- Competitive analysis (are competitors catching up?)

**Legal Page Updates:**
- Review privacy policy, GDPR, cookies, terms
- Update sitemap.xml lastmod dates if changed
- Verify all legal links in llms.txt still work

**Strategy Adjustment:**
- Review KPIs vs. targets
- Identify underperforming keywords
- Plan content updates for next quarter
- Consider additional schema markup implementation

---

## TROUBLESHOOTING

### Issue: Pages Not Being Indexed

**Diagnosis:**
1. Check Search Console "Coverage" report for errors
2. Test robots.txt allows indexing
3. Verify sitemap submitted correctly
4. Use "URL Inspection" tool in Search Console

**Solutions:**
- Request manual indexing via Search Console
- Check for canonical tag issues
- Ensure no `noindex` meta tags on pages
- Verify server returns 200 OK status

---

### Issue: AI Systems Not Citing Your Site

**Diagnosis:**
1. Check if AI crawlers are accessing site (server logs)
2. Verify llms.txt is accessible and properly formatted
3. Test robots.txt allows AI user-agents

**Solutions:**
- Wait 4-6 weeks for AI systems to re-crawl and ingest data
- Ensure llms.txt uses clear, structured format
- Add more specific FAQ items to llms.txt
- Verify no server-level blocks on AI user-agents

---

### Issue: Incorrect Information in AI Responses

**Diagnosis:**
1. Identify specific inaccuracy
2. Check if information exists in llms.txt
3. Verify llms.txt accuracy

**Solutions:**
- Update llms.txt with correct information
- Add explicit correction in FAQ section
- Wait 2-4 weeks for AI systems to re-crawl
- Submit updated sitemap to trigger re-crawl

---

## SUCCESS METRICS

### Month 1 Targets:
- ✅ All pages indexed in Google
- ✅ At least 2 AI crawler visits in server logs
- ✅ Baseline analytics data collected

### Month 3 Targets:
- 📈 20% increase in organic traffic
- 🎯 2-3 featured snippets owned
- 🤖 At least 1 accurate AI citation found

### Month 6 Targets:
- 📈 50% increase in organic traffic
- 🎯 5-10 featured snippets owned
- 🤖 Multiple AI platforms citing TS Finanse
- 💼 Measurable AI-driven lead conversions

---

## QUICK REFERENCE COMMANDS

```bash
# Test file accessibility
curl https://www.tsfinanse.com/robots.txt
curl https://www.tsfinanse.com/sitemap.xml
curl https://www.tsfinanse.com/llms.txt

# Validate sitemap XML
xmllint --noout /path/to/sitemap.xml

# Check robots.txt syntax
# Use: https://support.google.com/webmasters/answer/6062598

# Monitor AI crawlers in server logs (Apache/Nginx)
grep "GPTBot" /var/log/nginx/access.log
grep "anthropic-ai" /var/log/nginx/access.log
grep "PerplexityBot" /var/log/nginx/access.log
```

---

## SUPPORT RESOURCES

**Google Search Console:**
- Documentation: https://support.google.com/webmasters
- Sitemap Guide: https://developers.google.com/search/docs/crawling-indexing/sitemaps

**Robots.txt:**
- Google Guide: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Validator: https://support.google.com/webmasters/answer/6062598

**Schema Markup:**
- Schema.org: https://schema.org
- Google Structured Data Testing Tool: https://search.google.com/test/rich-results

**AI Crawler Information:**
- OpenAI GPTBot: https://platform.openai.com/docs/gptbot
- Anthropic Claude: https://www.anthropic.com/robots.txt
- Perplexity: https://docs.perplexity.ai/docs/perplexitybot

---

## FINAL NOTES

**Remember:**
1. SEO/AEO/GEO is a marathon, not a sprint
2. AI optimization takes 4-6 weeks to show results
3. Consistent updates to llms.txt improve AI accuracy
4. Monitor, measure, and adjust based on data

**Your Competitive Advantage:**
- Most Polish financial firms are NOT optimizing for AI
- You have 6-12 month head start
- Early algorithmic preference compounds over time

**When in Doubt:**
- Keep robots.txt open to AI crawlers
- Update llms.txt with accurate, detailed information
- Monitor Search Console for technical issues
- Test AI responses monthly and correct inaccuracies

---

**Checklist Version:** 1.0
**Last Updated:** 2025-11-09
**Next Review:** 2025-12-09
