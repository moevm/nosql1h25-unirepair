function range(from, to = undefined) {
  if (to === undefined && from.from !== undefined && from.to !== undefined)
    [from, to] = [from.from, from.to];
  return `${from !== undefined && from !== null ? from : ""};${to !== undefined && to !== null ? to : ""}`;
}

export default range;
