# ΩLYMPOS – Progressive Overload Tracker

This is a simple app for tracking your strength training progress. It focuses on logging just the weight and reps of your first set for each exercise to keep things uncomplicated while still showing your improvements over time.

## What it does

- Tracks your exercises with minimal input - just weight and reps from your first set
- Shows your progress history in a list and on a chart
- Stores everything locally in your browser - no servers or accounts needed
- Uses Chart.js for visualizing your progress (loads from CDN)

## How to use it

1. Add exercises you want to track
2. Enter new entries after your workouts
3. Check out the chart to see how your total load (weight × reps) changes over time
4. Delete entries or exercises if needed

The interface is pretty straightforward - just modals for adding exercises and logging sets. Everything updates automatically when you add new data.

## Access

The app is hosted on GitHub Pages, so you can use it right away without downloading anything. All your data stays in your browser's local storage.
https://larsenwald.github.io/OLYMPOS/

If you want to run it locally, just clone the repo and open index.html in any modern browser.

Feel free to modify the code if you want to add more features or change how it looks. Since it's all client-side with just vanilla JavaScript and localStorage, it's easy to tinker with.

## Thank you
A ridiculous amount of thought and work was put into the UX/UI design of the app. I hope you enjoy it!
