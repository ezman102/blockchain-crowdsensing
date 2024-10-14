from diffprivlib.mechanisms import Laplace

def apply_differential_privacy(aggregate_value, sensitivity=1, epsilon=0.1):
    mech = Laplace(epsilon=epsilon, sensitivity=sensitivity)
    noisy_value = mech.randomise(aggregate_value)
    return noisy_value
