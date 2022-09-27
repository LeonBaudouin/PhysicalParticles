export default abstract class LifeCycle {
  private unbinders: (() => void)[] = []

  protected toUnbind(...unbinders: (() => void)[]) {
    this.unbinders.push(...unbinders)
  }

  public destroy() {
    for (const unbinder of this.unbinders) unbinder()
  }
}
