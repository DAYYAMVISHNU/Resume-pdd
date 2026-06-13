import os
import shutil
import subprocess
import sys

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dist = os.path.join(root_dir, 'frontend', 'dist')
    flutter_assets = os.path.join(root_dir, 'mobile_flutter', 'assets', 'web')

    print("Building React frontend...")
    try:
        # Run npm run build inside frontend folder
        subprocess.run(["npm", "run", "build", "--prefix", "frontend"], shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error building frontend: {e}")
        sys.exit(1)

    print(f"Syncing built files to {flutter_assets}...")
    try:
        if os.path.exists(flutter_assets):
            shutil.rmtree(flutter_assets)
        shutil.copytree(frontend_dist, flutter_assets)
        print("Offline web assets synced to Flutter app successfully!")
    except Exception as e:
        print(f"Error copying files: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
