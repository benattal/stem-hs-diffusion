A deep neural network is a large stack of learned filters. 

* Build through: 
first layer learns simple filters (blurs, edges, Sobel-like detectors) 
→ second layer combines those to detect corners and textures 
→ third layer recognizes parts of objects (faces, paws, petals). 
The difference from what we've been doing: instead of designing kernels by hand, the network learns them automatically from millions of examples — but the underlying operation is the same convolution we've been applying all along.
