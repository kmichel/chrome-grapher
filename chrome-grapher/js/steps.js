function generate_steps(range, pixels, min_step_size) {
    var max_step_count = Math.floor(pixels / min_step_size);
    var min_step_amount = range / max_step_count;
    var step_amount = Math.pow(10, Math.ceil(Math.log(min_step_amount) / Math.LN10));
    var step_size = step_amount / range * pixels;
    if (step_size * .2 >= min_step_size) {
        step_size *= .2;
        step_amount *= .2;
    } else if (step_size * .5 >= min_step_size) {
        step_size *= .5;
        step_amount *= .5;
    }
    var steps = [];
    for (var px = step_size, val = step_amount; px < pixels; px += step_size, val += step_amount)
        steps.push({
            x: px,
            label: val >= 1000 ? (val / 1000).toPrecision(3) + " s" : val.toPrecision(3) + " ms"});
    return steps;
}
