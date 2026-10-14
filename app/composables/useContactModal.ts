export const useContactModal = () => {
  const open = useState('contact-modal-open', () => false)
  return {
    open,
    show: () => (open.value = true),
    hide: () => (open.value = false)
  }
}
