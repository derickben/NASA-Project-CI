const DEFAULT_PAGE_LIMIT = 0;
const DEFAULT_PAGE_NUMBER = 1;

exports.getPagination = (query) => {
  let { limit = DEFAULT_PAGE_LIMIT, page = DEFAULT_PAGE_NUMBER } = query;
  limit = Math.abs(limit);
  page = Math.abs(page);
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
};
