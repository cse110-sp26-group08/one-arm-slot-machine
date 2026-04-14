# Final Report

## Important to mention

Codex did not allow us to calculate the exact number of output tokens, it just gave us the total tokens used to the nearest thousand. So we caculated our tokens for the measurements.md file by using OpenAI's online tokenzier to get the tokens for our input prompt. Then we got the total number of tokens used by Codex throught the codex vscode extension. Finally, to get the total output tokens we subtracted the total number of tokens by the input prompt tokens.

## Step 1: Initial Selection

Out of the 50 websites we generated, we shortlisted 5 candidates for the first step of refinement: candidate-004, candidate-008, candidate-024, candidate-038, and candidate-050. The selection process involved each team member individually evaluating 4-5 websites using the rubric, then coming together as a team to collectively reevaluate and narrow down to our top 5.

We identified several key qualities we were looking for in our final design:

- Websites that utilized emojis instead of text for the slot machine symbols
- Websites that incorporated sound effects when you clicked spin
- Websites with consistent color themes, with a preference for blue over other colors

Given these design preferences, we decided to make sure our refinement prompts addressed these three elements specifically and also included a snippet about improving code quality and spacing out functions in the JavaScript file to avoid cluttered code.

### Original Prompt

```
Create a slot machine app that uses vanilla web technology like HTML, CSS, JavaScript, and platform APIs. The slot machine should make fun of AI, as in you are winning tokens and spending tokens.
```

See [Step 1 Results](results/STEP1-RESULTS.md) for detailed observations.

## Step 2: First Refinement

Out of the 5 websites from Step 1, we refined them and then shortlisted 3 candidates for the second refinement: candidate-004-refinement-1, candidate-008-refinement-1, and candidate-024-refinement-1. Through our evaluation, we found that we preferred simple websites over complicated ones because the more complicated designs tended to not be functional or have too many features that didn't work properly.

### Refinement Prompt

```
Improve the website according to the below requirements
1. Add sounds
2. Display on each round, how many tokens were gained vs spent
3. Explicitly show patterns if any on the wheel
4. Allow multiple plays and show the starting amount.

Overall, make the website theme consistent including colors and fonts
Make the website more readable and remove redundant text.

Make the code more readable and manageable
1. modularize the code
2. add documentation so that readers can understand what is what
```

### Key Observations

We liked websites with consistent colors. However, a significant gap we noticed was that all 5 websites were missing a stop button for the spinning animation, which we felt was important for user experience. Additionally, the websites were starting to show inconsistent color patterns, which made the overall design feel less polished.

We also noted that the code in all the websites was originally contained in a single JavaScript file, and we thought that perhaps splitting this into multiple files might help us achieve the features we wanted more effectively.

See [Step 2 Results](results/STEP2-RESULTS.md) for detailed observations.

## Step 3: Second Refinement

Out of the 3 websites from Step 2, we refined them again and shortlisted 2 candidates for the third refinement: candidate-004-refinement-2 and candidate-024-refinement-2. We eliminated candidate-008-refinement-1 because it had too many problems including inconsistent fonts and missing buttons for expanding/contracting content, issues that the other two candidates handled much better.

The remaining 2 candidates showed more promise in terms of design consistency and interface functionality.

### Refinement Prompt

```
Make the website simpler,
1. remove or hide unnecessary widgets by letting them contract and expand
2. have a stop button if multiple spins are made. So also allow user to play once with multiple spins.
3. make the play button centered and prominent

Also make the overall UI more readable
1. For the balance stats, have larger headings and organize them instead of having all in a row
2. for the round history, have a table showing, what was the output of slot machine, which category of win/loss its in and the net token change amount.
3. highlight matching pairs/triplets

Code readability,
1. make css more modular/readable
```

See [Step 3 Results](results/STEP3-RESULTS.md) for detailed observations.

## Step 4: Third Refinement

Out of the 2 websites from Step 3, we refined them and continued with only candidate-004-refinement-3 for the final step. The elimination of candidate-024-refinement-2 was necessary because it accumulated too many problems that were difficult to fix. These issues included elements that were not properly aligned, incorrect token counts displayed on wins, and expandable widgets that did not properly contract.

It was clear that one website was significantly better than the other, as the previous refinement prompt had caused more harm than benefit for candidate-024.

### Refinement Prompt

```
1. Add consistency to font size
2. Add better animations for expanding/contracting widgets
3. add hover effects
4. Resize the elements as rn they are so big that the play button is not visible on first load (without scrolling). You can also send the Session summary/token summary to the left but keep in mind that the website should be responsive
5. Allow user to spend more tokens per spin
```

See [Step 4 Results](results/STEP4-RESULTS.md) for detailed observations.

## Final Step: Final Refinement

We decided on candidate-004 as our final website, though it was obvious to us before the refinements exactly which one we would be picking. We mainly focused our refinements on this candidate, ensuring it had the polish and features we wanted.

### Refinement Prompt

```
Make the following changes
1. for the expandable widgets, the labels must be of same font size, and no need to write expand when needed
2. number of tokens on win should reflect the actual amount based on the tokens per spin bet amount.
3. add a light/dark theme toggle
4. the website title should be at center and then the grid/flex layout should start below it.
5. send pattern guide and symbols to the left and last round should be current round and to the right above round history.
6. round history should show recent 6 but let the user see previous ones by scrolling the window until session is reseted
7. untill all the spins are completed only the wheel and stop button widget should be visible, everything else should be darkened to give an effect that spining is active.
8. On phone view the spin wheel and play button widget should be at top everything else below (session overview then everything else)
```

### What We Liked

- The implementation of Light/Dark mode was well done and provided good user flexibility
- The responsiveness of the website was handled nicely, with the play widget positioned on the top of the page rather than in the middle, which improved usability

### What We Wanted to Improve

Even after explicitly asking Codex to fix inconsistent font sizes, the problem still persisted in the final version. Additionally, although we requested a dynamic winnings indicator, the pattern guide still showed static information based on the base wager rather than updating dynamically based on actual wins.

See [Step 5 Final Results](results/STEP5-FINAL-RESULTS.md) for detailed observations.

## Final Thoughts

This experiment gave us a sense of how easily LLMs can become confused by seemingly obvious instructions. Sometimes, when we mentioned something in our refined prompts, the AI would include what we asked for but remove features we liked from the original website. The main takeaway we got was that LLMs are very sensitive to the prompts you give them. They will take instructions quite literally, but you also need to explicitly specify elements you want to keep from the original boilerplate. Understanding this balance between making new requests and preserving existing features is crucial when working with generative AI.
