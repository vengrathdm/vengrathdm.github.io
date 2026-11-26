# Minimal Session Recorder template

This ZIP contains exactly three files:

- `Recorder.html` — standalone recap player.
- `sessiondataentry.json` — editable example session data.
- `README.md` — run instructions and data format.

## Run

1. Extract all three files into the same folder.
2. Open `Recorder.html` in a modern browser.
3. Click **Open session JSON** and select `sessiondataentry.json`.
4. Click **Play**. Use the slider to jump between moments.

No build step, package installation, or local server is required. The example images are hosted by Unsplash, so an internet connection is needed to display them. Replace those URLs with your own image URLs as needed.

## Session data format

The essential structure is:

```json
{
  "title": "Session title",
  "sessionNumber": 1,
  "secondsPerMoment": 8,
  "moments": [
    {
      "image": "https://example.com/scene.jpg",
      "blocks": [{ "text": "Text displayed over the image" }]
    }
  ]
}
```

Add more objects to `moments` to extend the recap. `secondsPerMoment` sets the automatic playback duration for each moment. The player displays the `text` values in each moment's `blocks` array.

## Scope

This is a minimal recap player, not a tool for capturing live audio or video. It plays a prepared sequence of still images and text. The sample also includes fields such as `transition`, `x`, `y`, `width`, `font`, `fontSize`, and `align` as future-facing content metadata; this minimal version does not yet implement custom positioning or transition effects. The stage maintains a 16:9 aspect ratio and scales to the browser width.
