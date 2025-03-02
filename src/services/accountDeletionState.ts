export const AccountDeletionState = {
  isInProgress: false,

  startDeletion() {
    this.isInProgress = true;
    console.log("Account deletion started, token refreshing paused");
  },

  endDeletion() {
    this.isInProgress = false;
    console.log("Account deletion process complete, token refreshing resumed");
  },

  isDeletionInProgress() {
    return this.isInProgress;
  }
};
