Build through: 

Gradient magnitude → Non-maximum suppression (thins every edge to one pixel wide by keeping only the local maximum along each edge direction)

→ Double threshold (separates strong edges from weak ones) 

→ Final edges (keep weak edges only if connected to a strong one — removes noise while preserving real detail). 

Five steps, all built on filtering.