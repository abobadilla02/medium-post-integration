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
  - radio "Schedule for Later"
  - text: Schedule for Later
  - radio "Publish Now" [checked]
  - text: Publish Now The post will be published immediately to Medium. Post Title
  - textbox "Post Title": Immediate Publish Post
  - text: Post Content (Markdown)
  - textbox "Post Content (Markdown)": This post should be published immediately
  - text: "You can use Markdown formatting like **bold**, *italic*, # headings, and more. RapidAPI Key (Optional)"
  - textbox "RapidAPI Key (Optional)": test-api-key
  - strong: "Note:"
  - text: We're using the Unofficial Medium API via RapidAPI. For now, posts are simulated. To get real API access, sign up at
  - link "RapidAPI Medium API":
    - /url: https://rapidapi.com/letscrape-6bRBa3QguO5/api/medium2
  - text: and add your key to the backend environment variables.
  - button "Publish Now"
```