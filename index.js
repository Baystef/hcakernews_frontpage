const body = document.querySelector('.main-contents');
const url = 'https://www.graphqlhub.com/graphql';

// Utility functions
const createElement = (el) => document.createElement(el);
const cleanURL = (url) => {
  return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
}
const timeDiff = (timestamp) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = new Date() - new Date(timestamp);
  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed/1000)} second(s) ago`;
  }
  else if (elapsed < msPerHour) {
    return `${Math.round(elapsed/msPerMinute)} minute(s) ago`;
  }
  else if (elapsed < msPerDay) {
    return `${Math.round(elapsed/msPerHour)} hour(s) ago`;
  }
  else if (elapsed < msPerMonth) {
    return `${Math.round(elapsed/msPerDay)} day(s) ago`;
  }
  else if (elapsed < msPerYear) {
    return `${Math.round(elapsed/msPerMonth)} month(s) ago`;
  }
  else {
    return `${Math.round(elapsed/msPerYear)} year(s) ago`;
  }
}

// Helper function for building GraphQL query
const getStoriesQuery = (limit, offset) => `
 {
  hn {
    topStories(limit: ${limit}, offset: ${offset}) {
      title
      by {
        id
      }
      url
      score
      timeISO
      descendants
    }
  }
}`

const loadStories = (e) => {
  e.preventDefault();
  body.innerHTML = '<p>Loading...</p>';

  const options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      query: getStoriesQuery(30, 1) 
    }),
  };

  fetch(url, options)
    .then(res => res.json())
    .then((response) => {
      const { topStories } = response.data.hn;
      let data = '';
      topStories.forEach((story) => {
        const shortened = cleanURL(`${story.url}`);
        const timeAgo = timeDiff(`${story.timeISO}`);
        data += `
      <li class="main-content">
          <a href="${story.url}" class="main-content_title">${story.title}</a>
          <span class="main-content_site">(<a href="${shortened}">${shortened}</a>)</span>
          <p class="main-content_details">
            <span class="main-content_stats">${story.score} points by ${story.by.id} ${timeAgo}</span> |
            <span class="main-content_hide">hide</span> | <span class="main-content_comments">${story.descendants}&nbsp;comments</span>
          </p>
        </li>`;
      });
      body.innerHTML = data;

      const moreLink = createElement('a')
      moreLink.textContent = 'More';
      moreLink.setAttribute('class', 'morelink');
      body.parentNode.insertBefore(moreLink, body.nextSibling);
    })
    .catch((error) => {
      body.innerHTML = `<p>Check your internet connection or refresh this page`;
      console.log(error);
    })
};

window.onload = loadStories;