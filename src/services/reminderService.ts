export const setReminder = (job: { company: string; position: string }, date: Date) => {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        const timeDiff = date.getTime() - new Date().getTime();
        setTimeout(() => {
          new Notification('Job Application Reminder', {
            body: `Don't forget to follow up on your ${job.position} application at ${job.company}!`
          });
        }, timeDiff);
      }
    });
  }
};