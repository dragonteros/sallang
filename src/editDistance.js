export function distanceInsDel(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    // Create a 2D array to store the distance and operation counts
    let dp = Array.from(Array(len1 + 1), () => Array(len2 + 1).fill(0));

    // Initialize the table
    for (let i = 0; i <= len1; i++) dp[i][0] = i; // cost of deletions
    for (let j = 0; j <= len2; j++) dp[0][j] = j; // cost of insertions

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]; // No cost if characters match
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,     // Deletion
                    dp[i][j - 1] + 1      // Insertion
                );
            }
        }
    }

    // Backtrack to find number of insertions, deletions
    let i = len1, j = len2;
    let insertions = 0, deletions = 0;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && str1[i - 1] === str2[j - 1]) {
            i--;
            j--;
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
            deletions++;
            i--;
        } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
            insertions++;
            j--;
        }
    }

    return {
        distance: dp[len1][len2],
        insertions: insertions,
        deletions: deletions,
    };
}
