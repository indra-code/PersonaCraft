FROM continuumio/miniconda3

WORKDIR /app
RUN conda clean --all -y

# Create base environment with minimal packages
RUN conda create -n nisqa python=3.9 -y

# Install packages in smaller groups
COPY environment.yml .
RUN conda install -n nisqa -c pytorch pytorch torchvision -y && \
    conda install -n nisqa -c conda-forge ffmpeg -y && \
    conda run -n nisqa pip install tqdm numpy scipy

# Add more packages as needed in separate RUN commands

SHELL ["conda", "run", "-n", "nisqa", "/bin/bash", "-c"]

COPY . .

EXPOSE 5000

ENTRYPOINT ["conda", "run", "-n", "nisqa", "python", "app.py"]