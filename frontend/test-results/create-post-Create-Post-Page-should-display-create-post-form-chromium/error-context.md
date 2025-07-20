# Page snapshot

```yaml
- banner:
  - navigation:
    - heading "Medium Scheduler" [level=1]
    - list:
      - listitem:
        - link "Create Post":
          - /url: /
      - listitem:
        - link "View Posts":
          - /url: /posts
- main:
  - heading "Create a New Post" [level=2]
  - radio "Schedule for Later" [checked]
  - text: Schedule for Later
  - radio "Publish Now"
  - text: Publish Now The post will be scheduled and published at the specified time. Post Title
  - textbox "Post Title"
  - text: Post Content (Markdown)
  - textbox "Post Content (Markdown)"
  - text: "You can use Markdown formatting like **bold**, *italic*, # headings, and more. Schedule For"
  - textbox "Schedule For"
  - text: Choose when you want this post to be published to Medium (minimum 1 minute from now). RapidAPI Key (Optional)
  - textbox "RapidAPI Key (Optional)"
  - strong: "Note:"
  - text: We're using the Unofficial Medium API via RapidAPI. For now, posts are simulated. To get real API access, sign up at
  - link "RapidAPI Medium API":
    - /url: https://rapidapi.com/letscrape-6bRBa3QguO5/api/medium2
  - text: and add your key to the backend environment variables.
  - button "Schedule Post"
```